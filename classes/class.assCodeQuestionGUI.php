<?php

require_once "./Modules/TestQuestionPool/classes/class.assQuestionGUI.php";
require_once "./Modules/Test/classes/inc.AssessmentConstants.php";
require_once './Modules/TestQuestionPool/interfaces/interface.ilGuiQuestionScoringAdjustable.php';
require_once './Modules/TestQuestionPool/interfaces/interface.ilGuiAnswerScoringAdjustable.php';

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
class assCodeQuestionGUI extends assQuestionGUI implements ilGuiQuestionScoringAdjustable, ilGuiAnswerScoringAdjustable
{
	/**
	 * @const	string	URL base path for including special javascript and css files
	 */
	const URL_PATH = "./Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion";

	/**
	 * @const	string 	URL suffix to prevent caching of css files (increase with every change)
	 * 					Note: this does not yet work with $tpl->addJavascript()
	 */
	const URL_SUFFIX = "?css_version=1.5.6";

	/**
	 * @var ilassCodeQuestionPlugin	The plugin object
	 */
	var $plugin = NULL;


	/**
	 * @var assCodeQuestion	The question object
	 */
	var $object = NULL;

	var $lang_user = 'en';
	
	/**
	* Constructor
	*
	* @param integer $id The database id of a question object
	* @access public
	*/
	public function __construct($id = -1)
	{
		parent::__construct();
		include_once "./Services/Component/classes/class.ilPlugin.php";
		$this->plugin = ilPlugin::getPluginObject(IL_COMP_MODULE, "TestQuestionPool", "qst", "assCodeQuestion");
		$this->plugin->includeClass("ui/codeBlockUI.php");
		$this->plugin->includeClass("class.assCodeQuestion.php");
		$this->object = new assCodeQuestion();
		if ($id >= 0)
		{
			$this->object->loadFromDb($id);
		}		
		global $DIC;
		
		$this->lang_user = $this->plugin->txt('used_lang');
		if ('-qpl_qst_codeqst_used_lang-' == $this->lang_user) $this->lang_user = 'en';		
	}

	function getLanguage() {
		return $this->object->blocks()->getLanguage();
	}

	var $didPrepare = false;
	var $didAddLinksToSolutions = false;
	private function getLanguageData(){
		$language = $this->getLanguage();
		$inLanguage = $language;
		// prepare language for hilight.js
		$hljslanguage = $language;
		$mode = $language;
		if ($language=="java") {
			$language = "clike";
			$mode = "text/x-java";
		} if ($language=="java2") {
			$language = "java";
			$mode = "text/x-java";
		} else if ($language=="c++") {
			$hljslanguage = 'cpp';
			$language = "clike";
			$mode = "text/x-c++src";
		} else if ($language=="c") {
			$language = "clike";
			$mode = "text/x-csrc";
		} else if ($language=="objectivec") {
			$language = "clike";
			$mode = "text/x-objectivec";
		} else if ($language=="glsl") {
			$language = "clike";
			$mode = "text/x-glsl";
		} 

		return array(
			'cmLanguage'=>$language,
			'cmMode'=>$mode,
			'hljsLanguage'=>$hljslanguage,
			'org'=>$inLanguage
			);
	}

	private function prepareTemplate($force=false, $negativeQuestionID=false)
	{
		$qidf = $negativeQuestionID?-1:1;
		$lngData = $this->getLanguageData();
		
		$this->object->blocks()->ui()->prepareTemplate($this->tpl, self::URL_PATH);			
	}

	/**
	 * Creates an output of the edit form for the question
	 *
	 * @param bool $checkonly
	 * @return bool
	 */
	public function editQuestion($checkonly = FALSE)
	{
		include_once "./Services/AdvancedEditing/classes/class.ilObjAdvancedEditing.php";

		global $lng;
		$lngData = $this->getLanguageData();

		$save = $this->isSaveCommand();
		$this->getQuestionTemplate();
		$this->prepareTemplate();

		include_once("./Services/Form/classes/class.ilPropertyFormGUI.php");
		$form = new ilPropertyFormGUI();
		$form->setFormAction($this->ctrl->getFormAction($this));
		$form->setTitle($this->outQuestionType());
		$form->setMultipart(TRUE);
		$form->setTableWidth("100%");
		$form->setId("codeqst");
		$form->setDescription($this->plugin->txt('question_edit_info'));
		$this->addBasicQuestionFormProperties( $form );
		$this->populateQuestionSpecificFormPart( $form );
		$this->populateAnswerSpecificFormPart( $form );

		// Here you can add question type specific form properties
		$this->populateTaxonomyFormSection($form);
		$this->addQuestionFormCommandButtons($form);

		$errors = false;

		if ($save)
		{
			$form->setValuesByPost();
			$errors = !$form->checkInput();
			$form->setValuesByPost(); // again, because checkInput now performs the whole stripSlashes handling and we need this if we don't want to have duplication of backslashes
			if ($errors) $checkonly = false;
		}

		if (!$checkonly)
		{
			$this->tpl->setVariable("QUESTION_DATA", $form->getHTML());
		}
		return $errors;
	}

	/**
	 * Evaluates a posted edit form and writes the form data in the question object
	 *
	 * @param bool $always
	 * @return integer A positive value, if one of the required fields wasn't set, else 0
	 */
	public function writePostData($always = false)
	{
		$hasErrors = (!$always) ? $this->editQuestion(true) : false;
		if (!$hasErrors)
		{			
			$this->writeQuestionGenericPostData();
			$this->writeQuestionSpecificPostData(new ilPropertyFormGUI());
			$this->writeAnswerSpecificPostData(new ilPropertyFormGUI());

			$this->saveTaxonomyAssignments();
			return 0;
		}
		return 1;
	}

	private function printableString($value){
		$value = str_replace("\t", "  ",$value);
		$value = str_replace(" ", "&nbsp;",$value);
		$value = str_replace("\n", "<br />", $value);

		return $value;
	}

	/**
	 * Get the html output of the question for different usages (preview, test)
	 *
	 * @param    array            values of the user's solution
	 *
	 * @see assAccountingQuestion::getSolutionSubmit()
	 */
	private function getQuestionOutput($value1, $value2, $template=NULL, $show_question_text=true, $htmlResults=false, $readOnly=false, $negativeQuestionID=false, $active_id=NULL, $print=false)
	{		
		//print_r("[getQuestionOutput value1=".print_r($value1, true).", value2=".print_r($value2, true).", tmpl=".($template==NULL).", show_question_text=$show_question_text, htmlResults=$htmlResults, readOnly=$readOnly, negativeQuestionID=$negativeQuestionID, active_id=$active_id, print=$print] "); 
		$qidf = $negativeQuestionID?-1:1;
		$this->prepareTemplate(false, $negativeQuestionID);
		$language = $this->getLanguage();				

		if ($template == NULL) {
			$template = $this->plugin->getTemplate("tpl.il_as_qpl_codeqst_output.html");
		}

		$oldUUID = $this->object->blocks()->ui()->getUUID();
		if ($negativeQuestionID) {
			$this->object->blocks()->ui()->setUUID("0-".$oldUUID);
		}
		$template->setVariable("UUID", $this->object->blocks()->ui()->getUUID());
		if ($show_question_text==true){
			$questiontext = $this->object->getQuestion();
			$questiontext = $this->object->prepareTextareaOutput($questiontext, TRUE);			
			$template->setVariable("QUESTIONTEXT", $questiontext);
		} else {
			$template->setVariable("QUESTIONTEXT", "");
		}			

		$html = '';

		
		//get the student solution		
		$solutions = $value1;
		$state = $value2;					

		$html = $this->object->blocks()->ui()->render(false, $readOnly, true, $solutions, $state);

		$template->setVariable("BLOCK_HTML", $html);		
		$template->setVariable("LANGUAGE", $language);
		
		$template->setVariable("QUESTION_ID", $this->object->getId()*$qidf);
		$template->setVariable("LABEL_VALUE1", $this->plugin->txt('label_value1'));

		if ($negativeQuestionID) {
			$this->object->blocks()->ui()->setUUID($oldUUID);
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
	public function getTestOutput($active_id, $pass = NULL, $is_postponed = FALSE, $use_post_solutions = FALSE, $show_feedback = FALSE)
	{
		//print_r("getTestOutput(active_id=" . $active_id . ", pass=".$pass . ", is_postponed=".$is_postponed . ", use_post_solutions=".$use_post_solutions . ", show_feedback=".$show_feedback . ")");  die;
		include_once "./Modules/Test/classes/class.ilObjTest.php";
		if (is_NULL($pass))
		{
			$pass = ilObjTest::_getPass($active_id);
		}
		$solutions = $this->object->getSolutionValuesOrInit($active_id, $pass, true, true);
		$questionoutput = $this->getQuestionOutput($solutions['value1'], $solutions['value2']);
		$pageoutput = $this->outQuestionPage("", $is_postponed, $active_id, $questionoutput);
		return $pageoutput;
	}

	
	/**
	 * Get the output for question preview ("Preview Button")
	 * (called from ilObjQuestionPoolGUI)
	 * 
	 * @param boolean	show only the question instead of embedding page (true/false)
	 */
	public function getPreview($show_question_only = FALSE, $showInlineFeedback = FALSE)
	{
		// print_r($this->getPreviewSession());
		// echo "\n-------";
		// print_r("getPreview(show_question_only=" . $show_question_only . ", showInlineFeedback=".$showInlineFeedback . ")");
		
		$solution = (array) $this->object->getPreviewValuesOrInit($this->getPreviewSession(), true, true);
		// print_r($this->getPreviewSession());	
		// die;
		$questionoutput = $this->getQuestionOutput($solution['value1'], $solution['value2']);		
		if(!$show_question_only)
		{
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
	 * @param boolean $graphicalOutput       Show visual feedback for right/wrong answers
	 * @param boolean $result_output         Show the reached points for parts of the question
	 * @param boolean $show_question_only    Show the question without the ILIAS content around
	 * @param boolean $show_feedback         Show the question feedback
	 * @param boolean $show_correct_solution Show the correct solution instead of the user solution
	 * @param boolean $show_manual_scoring   Show specific information for the manual scoring output
	 * @return The solution output of the question as HTML code
	 */
	function getSolutionOutput(
		$active_id,
		$pass = NULL,
		$graphicalOutput = FALSE,
		$result_output = FALSE,
		$show_question_only = TRUE,
		$show_feedback = FALSE,
		$show_correct_solution = FALSE,
		$show_manual_scoring = FALSE,
		$show_question_text = TRUE
	)
	{
		//print_r("getSolutionOutput active_id=$active_id pass=$pass graphicalOutput=$graphicalOutput result_output=$result_output show_question_only=$show_question_only show_feedback=$show_feedback show_correct_solution=$show_correct_solution show_manual_scoring=$show_manual_scoring show_question_text=$show_question_text"); 

		$print = $this->isRenderPurposePrintPdf();		
		$showStudentResults = ($active_id > 0) && (!$show_correct_solution);
		//echo "showStudentResults=".$showStudentResults."<br>";
		
		// get the solution template
		$template = $this->plugin->getTemplate("tpl.il_as_qpl_codeqst_output_solution.html");	

		//this is requested through ajax and added to the already loaded DOM
		if ($show_manual_scoring){
			// always load jQuery
			include_once("./Services/jQuery/classes/class.iljQueryUtil.php");
			iljQueryUtil::initjQuery($template);
			iljQueryUtil::initjQueryUI($template);

			$this->object->blocks()->ui()->prepareTemplate($template, self::URL_PATH);

			//we need this for the manual scoring view, otherwise the boxes have to get clicked
			$template->addOnLoadCode("setTimeout(function() {document.querySelectorAll('.CodeMirror').forEach(e => e.CodeMirror.refresh());}, 500)");

			$template->setCurrentBlock("DEFAULT");
			$template->fillCssFiles();
			$template->fillInlineCss();
			$template->fillJavaScriptFiles();
			$template->fillOnLoadCode();
		}

		// get the solution of the user for the active pass or from the last pass if allowed
		$solutions = array();
		if ($showStudentResults)
		{
			// get the answers of the user for the active pass or from the last pass if allowed
			$solutions = $this->object->getSolutionValuesOrInit($active_id, $pass, true, false);			
		}
		else
		{		
			$stored = $this->object->getSolutionValuesOrInit($active_id, $pass, true, false);
			$rid = -1;
			if (isset($stored['value2']) && isset($stored['value2']->rid)) $rid = $stored['value2']->rid;
			$solutions = $this->object->blocks()->getBestRandomSolution($rid);		
			$stored['value2']->blocks = $solutions;

			// show the correct solution
			$solutions = array(
				"value1" => $solutions,
				"value2" => $stored['value2']
			);			
		}

		$value1 = $solutions['value1'];
		$value2 = $solutions['value2'];
		
			
		if ($showStudentResults)
		{
			if ($graphicalOutput)
			{
				// copied from assNumericGUI, yet not really understood
				if($this->object->getStep() === NULL) 
					$reached_points = $this->object->getReachedPoints($active_id, $pass);				
				else 
					$reached_points = $this->object->calculateReachedPoints($active_id, $pass);	
			}
		}		

		$questionoutput = $this->getQuestionOutput($value1, $value2, $template, $show_question_text, true, true, !$showStudentResults, $_GET['cmd'] == 'getAnswerDetail'?$active_id :NULL, $print);
		
		$solutiontemplate = new ilTemplate("tpl.il_as_tst_solution_output.html", TRUE, TRUE, "Modules/TestQuestionPool");
		$solutiontemplate->setVariable("SOLUTION_OUTPUT", $questionoutput);

		$feedback = ($show_feedback) ? $this->getGenericFeedbackOutput($active_id, $pass) : "";
		if (strlen($feedback)) $solutiontemplate->setVariable("FEEDBACK", $this->object->prepareTextareaOutput( $feedback, true ));

		$solutionoutput = $solutiontemplate->get();	
		if(!$show_question_only)
		{
			// get page object output
			$solutionoutput = $this->getILIASPage($solutionoutput);
		}
		
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
	function getSpecificFeedbackOutput($userSolution)
	{
		// By default no answer specific feedback is defined
		$output = '';
		return $this->object->prepareTextareaOutput($output, TRUE);
	}
	
	
	/**
	* Sets the ILIAS tabs for this question type
	* called from ilObjTestGUI and ilObjQuestionPoolGUI
	*/
	public function setQuestionTabs()
	{
		global $rbacsystem, $ilTabs;
		
		$ilTabs->clearTargets();

		$this->ctrl->setParameterByClass("ilAssQuestionPageGUI", "q_id", $_GET["q_id"]);
		include_once "./Modules/TestQuestionPool/classes/class.assQuestion.php";
		$q_type = $this->object->getQuestionType();

		if (strlen($q_type))
		{
			$classname = $q_type . "GUI";
			$this->ctrl->setParameterByClass(strtolower($classname), "sel_question_types", $q_type);
			$this->ctrl->setParameterByClass(strtolower($classname), "q_id", $_GET["q_id"]);
		}

		if ($_GET["q_id"])
		{
			if ($rbacsystem->checkAccess('write', $_GET["ref_id"]))
			{
				// edit page
				$ilTabs->addTarget("edit_page",
					$this->ctrl->getLinkTargetByClass("ilAssQuestionPageGUI", "edit"),
					array("edit", "insert", "exec_pg"),
					"", "", $force_active);
			}
	
			// edit page
			$this->addTab_QuestionPreview($ilTabs);
		}

		$force_active = false;
		if ($rbacsystem->checkAccess('write', $_GET["ref_id"]))
		{
			$url = "";

			if ($classname) $url = $this->ctrl->getLinkTargetByClass($classname, "editQuestion");
			

			// edit question properties
			$ilTabs->addTarget("edit_question",
				$url,
				array("editQuestion", "save", "saveEdit", "originalSyncForm"),
				$classname, "", $force_active);
		}

		// add tab for question feedback within common class assQuestionGUI
		$this->addTab_QuestionFeedback($ilTabs);

		// add tab for question hint within common class assQuestionGUI
		$this->addTab_QuestionHints($ilTabs);

		// add tab for question's suggested solution within common class assQuestionGUI
		$this->addTab_SuggestedSolution($ilTabs, $classname);		

		// Assessment of questions sub menu entry
		if ($_GET["q_id"])
		{
			$ilTabs->addTarget("statistics",
				$this->ctrl->getLinkTargetByClass($classname, "assessment"),
				array("assessment"),
				$classname, "");
		}
		
		$this->addBackTab($ilTabs);
	}

	public function populateQuestionSpecificFormPart(\ilPropertyFormGUI $form)
	{
		global $lng;

		// We only add an input field for the maximum points
		// NOTE: in complex question types the maximum points are summed up by partial points
		$points = new ilNumberInputGUI($lng->txt('maximum_points'),'points');
		$points->setSize(3);
		$points->setMinValue(1);
		$points->allowDecimals(0);
		$points->setRequired(true);
		$points->setValue($this->object->getPoints());
		$form->addItem($points);
	
		$item = new ilCustomInputGUI('');
		$item->setPostVar('codeblock');	
		$item->setHTML($this->object->blocks()->ui()->render(true));
		$form->addItem($item);

		return $form;
	}

	public function populateAnswerSpecificFormPart(\ilPropertyFormGUI $form)
	{
		
	}

	/**
	 * Store the information from "Edit Question" in the Database
	 */
	public function writeQuestionSpecificPostData(ilPropertyFormGUI $form)
	{		
		$this->object->setPoints((int) $_POST["points"]);
		$this->object->blocks()->setFromPOST($_POST);			
	}

	public function writeAnswerSpecificPostData(ilPropertyFormGUI $form)
	{
		
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
	public function getAfterParticipationSuppressionAnswerPostVars()
	{
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
	public function getAfterParticipationSuppressionQuestionPostVars()
	{
		return getAfterParticipationSuppressionAnswerPostVars();
	}

	/**
	 * Returns an html string containing a question specific representation of the answers so far
	 * given in the test for use in the right column in the scoring adjustment user interface.
	 *
	 * @param array $relevant_answers
	 *
	 * @return string
	 */
	public function getAggregatedAnswersView($relevant_answers)
	{
		return ''; //print_r($relevant_answers,true);
	}

	public function isRenderPurposePrintPdf() {
		return isset($_GET['pdf']) && $_GET['pdf'];
	}
}
?>
