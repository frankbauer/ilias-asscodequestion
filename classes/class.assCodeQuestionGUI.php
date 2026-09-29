<?php

/**
 * Example GUI class for question type plugins
 *
 * @author	Frank Bauer <frank.bauer@fau.de>
 * @version	$Id:  $
 * @ingroup ModulesTestQuestionPool
 *
 * @ilctrl_iscalledby assCodeQuestionGUI: ilObjQuestionPoolGUI, ilObjTestGUI, ilQuestionEditGUI, ilTestExpressPageObjectGUI
 * @ilCtrl_Calls assCodeQuestionGUI: ilFormPropertyDispatchGUI
 */
class assCodeQuestionGUI extends assQuestionGUI implements ilGuiQuestionScoringAdjustable, ilGuiAnswerScoringAdjustable {
	/**
	 * @const	string	URL base path for including special javascript and css files
	 */
	const URL_PATH = "./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion";

	/**
	 * @var ilassCodeQuestionPlugin	The plugin object
	 */
	protected ilassCodeQuestionPlugin $plugin;


	/**
	 * @var assCodeQuestion	The question object
	 */
	var assCodeQuestion $question_object;

	var $lang_user = 'en';

	/**
	 * Constructor
	 *
	 * @param integer $id The database id of a question object
	 * @access public
	 */
	public function __construct($id = -1) {
		parent::__construct();
		$this->plugin = assCodeQuestion::initPluginObject("assCodeQuestion");
		$this->question_object = new assCodeQuestion();
		$this->object = $this->question_object;
		if ($id >= 0) {
			$this->question_object->loadFromDb($id);
		}
		global $DIC;

		$this->lang_user = $this->plugin->txt('used_lang');
		if ('-qpl_qst_codeqst_used_lang-' == $this->lang_user)
			$this->lang_user = 'en';
	}

	/**
	 * The posted form data (ILIAS no longer allows direct access to $_POST)
	 */
	private function getPostData(): array {
		global $DIC;
		$body = $DIC->http()->request()->getParsedBody();
		return is_array($body) ? $body : array();
	}

	function getLanguage() {
		return $this->question_object->blocks()->getLanguage();
	}

	var $didPrepare = false;
	var $didAddLinksToSolutions = false;
	private function getLanguageData() {
		$language = $this->getLanguage();
		$inLanguage = $language;
		// prepare language for hilight.js
		$hljslanguage = $language;
		$mode = $language;
		if ($language == "java") {
			$language = "clike";
			$mode = "text/x-java";
		}
		if ($language == "java2") {
			$language = "java";
			$mode = "text/x-java";
		} else if ($language == "c++") {
			$hljslanguage = 'cpp';
			$language = "clike";
			$mode = "text/x-c++src";
		} else if ($language == "c") {
			$language = "clike";
			$mode = "text/x-csrc";
		} else if ($language == "objectivec") {
			$language = "clike";
			$mode = "text/x-objectivec";
		} else if ($language == "glsl") {
			$language = "clike";
			$mode = "text/x-glsl";
		}

		return array(
			'cmLanguage' => $language,
			'cmMode' => $mode,
			'hljsLanguage' => $hljslanguage,
			'org' => $inLanguage
		);
	}

	private function prepareTemplate($force = false, $negativeQuestionID = false) {
		$qidf = $negativeQuestionID ? -1 : 1;
		$lngData = $this->getLanguageData();

		$this->question_object->blocks()->ui()->prepareTemplate($this->tpl, self::URL_PATH);
	}

	/**
	 * Creates an output of the edit form for the question
	 *
	 * @param bool $checkonly
	 * @return bool
	 */
	public function editQuestion(bool $checkonly = false, ?bool $is_save_cmd = null): bool {
		$save = $is_save_cmd ?? $this->isSaveCommand();
		$this->getQuestionTemplate();
		$this->prepareTemplate();

		$form = new ilPropertyFormGUI();
		$this->editForm = $form;
		$form->setFormAction($this->ctrl->getFormAction($this));
		$form->setTitle($this->outQuestionType());
		$form->setMultipart(TRUE);
		$form->setTableWidth("100%");
		$form->setId("codeqst");
		$form->setDescription($this->plugin->txt('question_edit_info'));
		$this->addBasicQuestionFormProperties($form);

		$errors = false;

		if ($save) {
			$form->setValuesByPost();
			$errors = !$form->checkInput();
			$form->setValuesByPost(); // again, because checkInput now performs the whole stripSlashes handling and we need this if we don't want to have duplication of backslashes

			//this reloads the posted data into the object
			$this->question_object->blocks()->setFromPOST($this->getPostData());

			if ($errors)
				$checkonly = false;
		}

		$this->populateQuestionSpecificFormPart($form);
		$this->populateAnswerSpecificFormPart($form);

		// Here you can add question type specific form properties
		$this->populateTaxonomyFormSection($form);
		$this->addQuestionFormCommandButtons($form);

		if (!$checkonly) {
			$this->renderEditForm($form);
		}
		return $errors;
	}

	/**
	 * Evaluates a posted edit form and writes the form data in the question object
	 *
	 * @param bool $always
	 * @return integer A positive value, if one of the required fields wasn't set, else 0
	 */
	public function writePostData(bool $always = false): int {
		$hasErrors = (!$always) ? $this->editQuestion(true) : false;
		if (!$hasErrors) {
			$this->writeQuestionGenericPostData();
			$this->writeQuestionSpecificPostData(new ilPropertyFormGUI());
			$this->writeAnswerSpecificPostData(new ilPropertyFormGUI());

			$this->saveTaxonomyAssignments();
			return 0;
		}
		return 1;
	}

	/**
	 * Get the html output of the question for different usages (preview, test)
	 *
	 * @param    array            values of the user's solution
	 *
	 * @see assAccountingQuestion::getSolutionSubmit()
	 */
	private function getQuestionOutput($value1, $value2, $template = NULL, $show_question_text = true, $htmlResults = false, $readOnly = false, $negativeQuestionID = false, $active_id = NULL, $print = false, $student_solution = true) {
		//$dddddd = print_r("[getQuestionOutput value1=".print_r($value1, true).", value2=".print_r($value2, true).", tmpl=".($template==NULL).", show_question_text=$show_question_text, htmlResults=$htmlResults, readOnly=$readOnly, negativeQuestionID=$negativeQuestionID, active_id=$active_id, print=$print] ", true); 
		$qidf = $negativeQuestionID ? -1 : 1;
		$this->prepareTemplate(false, $negativeQuestionID);
		$language = $this->getLanguage();

		if ($template == NULL) {
			$template = $this->plugin->getTemplate("tpl.il_as_qpl_codeqst_output.html");
		}

		$oldUUID = $this->question_object->blocks()->ui()->getUUID();
		if ($negativeQuestionID) {
			$this->question_object->blocks()->ui()->setUUID("0-" . $oldUUID);
		}
		$template->setVariable("UUID", $this->question_object->blocks()->ui()->getUUID());
		if ($show_question_text == true) {
			$questiontext = $this->question_object->getQuestion();
			$questiontext = $this->question_object->blocks()->processStringWithSet(
				$questiontext,
				$this->question_object->blocks()->getRandomSet(($value2 != NULL && isset($value2->rid)) ? $value2->rid : -1)
			);
			$questiontext = self::prepareTextareaOutput($questiontext, TRUE);
			$template->setVariable("QUESTIONTEXT", $questiontext);
		} else {
			$template->setVariable("QUESTIONTEXT", "");
		}

		$html = '';


		//get the student solution		
		$solutions = $value1;
		$state = $value2;

		// flat field names: the answer is posted with the page's form, which may also contain
		// questions that expect plain string values only (e.g. STACK in a learning module)
		$this->question_object->blocks()->ui()->setFlatFieldNames(true);
		if ($print) {
			$withCtrlChars = false;
			$html = $this->question_object->blocks()->ui()->print(false, $readOnly, true, $solutions, $state, $withCtrlChars);
		} else {
			$html = $this->question_object->blocks()->ui()->render(false, $readOnly, true, $solutions, $state);
		}
		$this->question_object->blocks()->ui()->setFlatFieldNames(false);

		$template->setVariable("BLOCK_HTML", $html);
		$template->setVariable("LANGUAGE", $language);

		$template->setVariable("QUESTION_ID", $this->question_object->getId() * $qidf);
		$template->setVariable("LABEL_VALUE1", $this->plugin->txt($student_solution ? 'label_value1' : 'label_value_best'));

		if ($negativeQuestionID) {
			$this->question_object->blocks()->ui()->setUUID($oldUUID);
		}
		$questionoutput = $template->get();
		return $questionoutput;
	}

	/**
	 * Get the HTML output of the question for a test (The way students see the test)
	 * (this function could be private)
	 * 
	 * @param integer $active_id			The active user id
	 * @param integer $pass					The test pass
	 * @param boolean $is_postponed			Question is postponed
	 * @param boolean $use_post_solutions	Use post solutions
	 * @param boolean $show_feedback		Show a feedback
	 * @return string
	 */
	public function getTestOutput(
		int $active_id,
		int $pass,
		bool $is_question_postponed = false,
		array|bool $user_post_solutions = false,
		bool $show_specific_inline_feedback = false
	): string {
		if ($pass < 0) {
			$pass = ilObjTest::_getPass($active_id);
		}
		$solutions = $this->question_object->getSolutionValuesOrInit($active_id, $pass, true, true);
		$questionoutput = $this->getQuestionOutput($solutions['value1'], $solutions['value2']);
		$pageoutput = $this->outQuestionPage("", $is_question_postponed, $active_id, $questionoutput);
		return $pageoutput;
	}


	/**
	 * Get the output for question preview ("Preview Button")
	 * (called from ilObjQuestionPoolGUI)
	 * 
	 * @param boolean	show only the question instead of embedding page (true/false)
	 */
	public function getPreview(bool $show_question_only = false, bool $show_inline_feedback = false): string {
		// print_r("getPreview(show_question_only=" . $show_question_only . ", showInlineFeedback=".$showInlineFeedback . ")");
		// print_r($this->getPreviewSession()->getParticipantsSolution());
		$solution = (array) $this->question_object->getPreviewValuesOrInit($this->getPreviewSession(), true, true);
		//  print_r($this->getPreviewSession());	
		//  print_r($solution);
		//  echo "count:".count($solution)."\n";	
		//  die;

		$questionoutput = $this->getQuestionOutput($solution['value1'], $solution['value2']);
		if (!$show_question_only) {
			// get page object output
			$questionoutput = $this->getILIASPage($questionoutput);
		}
		return $questionoutput;
	}

	/**
	 * Get the question solution output 
	 * 	 - (When student views the "Result" of a test run)
	 *   - (When in manual correction mode)
	 *   - (When best solution is requested in preview)
	 * @param integer $active_id             The active user id
	 * @param integer $pass                  The test pass
	 * @param boolean $show_solutions        Show visual feedback for right/wrong answers (checkmarks in multiple choice for example)
	 * @param boolean $result_output         Show the reached points for parts of the question
	 * @param boolean $show_question_only    Show the question without the ILIAS content around
	 * @param boolean $show_feedback         Show the question feedback
	 * @param boolean $show_correct_solution Show the correct solution instead of the user solution
	 * @param boolean $show_manual_scoring   Show specific information for the manual scoring output
	 * @return The solution output of the question as HTML code
	 */
	function getSolutionOutput(
		int $active_id,
		?int $pass = null,
		bool $show_solutions = false,
		bool $result_output = false,
		bool $show_question_only = true,
		bool $show_feedback = false,
		bool $show_correct_solution = false,
		bool $show_manual_scoring = false,
		bool $show_question_text = true,
		bool $show_inline_feedback = true
	): string {
		if ($pass === null) {
			$pass = -1;
		}


		$print = $this->isRenderPurposePrintPdf();
		//($active_id > 0) will default back to the best solution if no answer is present, this might cause problems when priting the solutions...
		$showStudentResults = ($active_id > 0) && (!$show_correct_solution);
		//$showStudentResults = (!$show_correct_solution);

		//$debugInfo = print_r("<pre>!!! DEBUG MODE !!! getSolutionOutput active_id=$active_id pass=$pass\n show_solutions=$show_solutions\n result_output=$result_output\n show_question_only=$show_question_only\n show_feedback=$show_feedback\n show_correct_solution=$show_correct_solution\n show_manual_scoring=$show_manual_scoring\n show_question_text=$show_question_text\n\n showStudentResults=$showStudentResults\n print=$print</pre>", true); 

		//echo "showStudentResults=".$showStudentResults."<br>";

		// get the solution template
		$template = $this->plugin->getTemplate("tpl.il_as_qpl_codeqst_output_solution.html");
		//this is requested through ajax and added to the already loaded DOM
		if ($show_manual_scoring) {
			$activeGlobalTpl = null;
			$global = true;
			if ($show_question_only == false || $this->tpl == null) {
				$global = false;
				$activeGlobalTpl = $template;
			} else {
				$global = true;
				$activeGlobalTpl = $this->tpl;

				// always load jQuery
				iljQueryUtil::initjQuery($activeGlobalTpl);
			}

			$this->question_object->blocks()->ui()->prepareTemplate($activeGlobalTpl, self::URL_PATH);

			if ($global) {
				//we need this for the manual scoring view, otherwise the boxes have to get clicked
				$activeGlobalTpl->addOnLoadCode("setTimeout(function() {document.querySelectorAll('.CodeMirror').forEach(e => e.CodeMirror.refresh());}, 500)");
				$activeGlobalTpl->addOnLoadCode("setTimeout(function() {document.querySelectorAll('.CodeMirror').forEach(e => e.CodeMirror.refresh());}, 1000)");
			}

			$template->setCurrentBlock("DEFAULT");
		}

		// get the solution of the user for the active pass or from the last pass if allowed
		$solutions = array();
		if ($showStudentResults) {
			// get the answers of the user for the active pass or from the last pass if allowed
			$solutions = $this->question_object->getSolutionValuesOrInit($active_id, $pass, true, false);

			//$debugInfo .= "<pre>STUDENT</pre>";	
		} else {
			//build best solution, but start with the student results	
			$stored = $this->question_object->getSolutionValuesOrInit($active_id, $pass, true, false);

			//generate the best solution for the picked random id
			$rid = -1;
			if (isset($stored['value2']) && isset($stored['value2']->rid))
				$rid = $stored['value2']->rid;
			$solutions = $this->question_object->blocks()->getBestRandomSolution($rid);

			//override the loaded best solution (with placeholders) with the one that fits the rid
			$stored['value2']->blocks = $solutions;

			// show the best solution
			$solutions = array(
				"value1" => $solutions,
				"value2" => $stored['value2']
			);
			//$debugInfo .= "<pre>SOLUTION</pre>";	
		}

		$value1 = $solutions['value1'];
		$value2 = $solutions['value2'];


		if ($showStudentResults) {
			if ($show_solutions) {
				// copied from assNumericGUI, yet not really understood
				if ($this->question_object->getStep() === NULL)
					$reached_points = $this->question_object->getReachedPoints($active_id, $pass);
				else
					$reached_points = $this->question_object->calculateReachedPoints($active_id, $pass);
			}
		}

		$questionoutput = $this->getQuestionOutput($value1, $value2, $template, $show_question_text, true, true, !$showStudentResults, $this->ctrl->getCmd() == 'getAnswerDetail' ? $active_id : NULL, $print, $showStudentResults);

		$solutiontemplate = new ilTemplate("tpl.il_as_tst_solution_output.html", TRUE, TRUE, "components/ILIAS/TestQuestionPool");
		$solutiontemplate->setVariable("SOLUTION_OUTPUT", $questionoutput);

		$feedback = ($show_feedback) ? $this->getGenericFeedbackOutput($active_id, $pass) : "";
		if (strlen($feedback))
			$solutiontemplate->setVariable("FEEDBACK", self::prepareTextareaOutput($feedback, true));

		$solutionoutput = $solutiontemplate->get();
		if (!$show_question_only) {
			// get page object output
			$solutionoutput = $this->getILIASPage($solutionoutput);
		}

		//return $debugInfo . '<hr>' . $solutionoutput;
		return $solutionoutput;
	}

	/**
	 * Returns the answer specific feedback for the question
	 *
	 * This method should be overwritten by the actual question.
	 *
	 * @todo Mark this method abstract!
	 * @param array $userSolution ($userSolution[<value1>] = <value2>)
	 * @return string HTML Code with the answer specific feedback
	 * @access public
	 */
	function getSpecificFeedbackOutput(array $userSolution): string {
		// By default no answer specific feedback is defined
		$output = '';
		return self::prepareTextareaOutput($output, TRUE);
	}


	public function populateQuestionSpecificFormPart(ilPropertyFormGUI $form): ilPropertyFormGUI {
		$lng = $this->lng;

		// We only add an input field for the maximum points
		// NOTE: in complex question types the maximum points are summed up by partial points
		$points = new ilNumberInputGUI($lng->txt('maximum_points'), 'points');
		$points->setSize(3);
		$points->setMinValue(1);
		$points->allowDecimals(0);
		$points->setRequired(true);
		$points->setValue($this->question_object->getPoints());
		$form->addItem($points);

		$item = new ilCustomInputGUI('');
		$item->setPostVar('codeblock');
		$item->setHTML($this->question_object->blocks()->ui()->render(true));
		$form->addItem($item);

		return $form;
	}

	public function populateAnswerSpecificFormPart(ilPropertyFormGUI $form): ilPropertyFormGUI {
		return $form;
	}

	/**
	 * Store the information from "Edit Question" in the Database
	 */
	public function writeQuestionSpecificPostData(ilPropertyFormGUI $form): void {
		$post = $this->getPostData();
		$this->question_object->setPoints((float) ($post["points"] ?? 0));
		$this->question_object->blocks()->setFromPOST($post);
	}

	public function writeAnswerSpecificPostData(ilPropertyFormGUI $form): void {

	}

	/**
	 * Returns a list of postvars which will be suppressed in the form output when used in scoring adjustment.
	 * The form elements will be shown disabled, so the users see the usual form but can only edit the settings, which
	 * make sense in the given context.
	 *
	 * E.g. array('cloze_type', 'image_filename')
	 *
	 * @return string[]
	 */
	public function getAfterParticipationSuppressionAnswerPostVars(): array {
		return array('block', 'source_lang');
	}

	/**
	 * Returns a list of postvars which will be suppressed in the form output when used in scoring adjustment.
	 * The form elements will be shown disabled, so the users see the usual form but can only edit the settings, which
	 * make sense in the given context.
	 *
	 * E.g. array('cloze_type', 'image_filename')
	 *
	 * @return string[]
	 */
	public function getAfterParticipationSuppressionQuestionPostVars(): array {
		return $this->getAfterParticipationSuppressionAnswerPostVars();
	}

}
?>