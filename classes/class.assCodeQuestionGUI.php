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
	const URL_SUFFIX = "?css_version=1.5.5";

	/**
	 * @var ilassCodeQuestionPlugin	The plugin object
	 */
	var $plugin = null;


	/**
	 * @var assCodeQuestion	The question object
	 */
	var $object = null;
	
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
		$this->plugin->includeClass("class.assCodeQuestion.php");
		$this->object = new assCodeQuestion();
		if ($id >= 0)
		{
			$this->object->loadFromDb($id);
		}		
	}

	function getLanguage() {
		return $this->object->getLanguage();
	}

	var $didPrepare = false;
	private function getLanguageData(){
		$language = $this->getLanguage();
		$inLanguage = $language;
		// prepare language for hilight.js
		$hljslanguage = $language;
		$mode = $language;
		if ($language=="java") {
			$language = "clike";
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
		} 

		return array(
			'cmLanguage'=>$language,
			'cmMode'=>$mode,
			'hljsLanguage'=>$hljslanguage,
			'org'=>$inLanguage
			);
	}
	private function prepareTemplate($force=false) {
		if ($this->didPrepare && !$force) return;
		$this->didPrepare = true;
		
		$lngData = $this->getLanguageData();
		//$this->tpl->addJavascript(self::URL_PATH.'/js/javapoly/javapoly.js');
		/*if ($lngData['cmLanguage'] == "python" && $this->object->getAllowRun()) {
			$this->tpl->addJavascript(self::URL_PATH.'/js/skulpt/skulpt.min.js');
			$this->tpl->addJavascript(self::URL_PATH.'/js/skulpt/skulpt-stdlib.js');
		} else*/ if ($lngData['org'] == "java" && $this->object->getAllowRun()) {
			$this->tpl->addJavascript(self::URL_PATH.'/js/browserfs/browserfs.min.js?&v='.microtime());
			$this->tpl->addJavascript(self::URL_PATH.'/js/doppio/doppio.js?&v='.microtime());
			$this->tpl->addJavascript(self::URL_PATH.'/js/JavaExec.js?&v='.microtime());
			$this->tpl->addJavascript(self::URL_PATH.'/js/java.js?&v='.microtime());
		}


		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/lib/codemirror.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/solarized.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/base16-dark.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/base16-light.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/xq-dark.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/xq-light.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/blackboard.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/midnight.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/codemirror/theme/neo.css'.self::URL_SUFFIX);
		$this->tpl->addCss(self::URL_PATH.'/js/highlight.js/styles/solarized-light.css'.self::URL_SUFFIX);
		
		
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/lib/codemirror.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/clike/clike.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/fortran/fortran.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/java/java.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/javascript/javascript.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/perl/perl.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/python/python.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/r/r.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/ruby/ruby.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/addon/edit/closebrackets.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/highlight.js/highlight.pack.js');

		$this->tpl->addJavascript(self::URL_PATH.'/js/codemirror/mode/'.$lngData['cmLanguage'].'/'.$lngData['cmLanguage'].'.js');
		$this->tpl->addJavascript(self::URL_PATH.'/js/helper.js?v='.microtime());
		$this->tpl->addOnLoadCode('initSolutionBox("'.$lngData['cmMode'].'","'.$this->getLanguage().'","'.$this->object->getId().'");');
		$this->tpl->addOnLoadCode("hljs.configure({useBR: false});$('pre[class=".$lngData['hljsLanguage']."][usebr=no]').each(function(i, block) { hljs.highlightBlock(block);});");
		$this->tpl->addOnLoadCode("hljs.configure({useBR:  true});$('pre[class=".$lngData['hljsLanguage']."][usebr=yes]').each(function(i, block) { hljs.highlightBlock(block);});");
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

	
	/**
	 * Show the question in Test mode
	 * (called from ilTestOutputGUI)
	 * 
	 * @param string $formaction			The action link for the form
	 * @param integer $active_id			The active user id
	 * @param integer $pass					The test pass
	 * @param boolean $is_postponed			Question is postponed
	 * @param boolean $use_post_solutions	Use post solutions
	 * @param boolean $show_feedback		Show a feedback
	 */
	/*public function outQuestionForTest($formaction, $active_id, $pass = NULL, $is_postponed = FALSE, $use_post_solutions = FALSE, $show_feedback = FALSE)
	{
		$test_output = $this->getTestOutput($active_id, $pass, $is_postponed, $use_post_solutions, $show_feedback); 
		$this->tpl->setVariable("QUESTION_OUTPUT", $test_output);
		$this->tpl->setVariable("FORMACTION", $formaction);
	}*/

	/**
	 * Get the html output of the question for different usages (preview, test)
	 *
	 * @param    array            values of the user's solution
	 *
	 * @see assAccountingQuestion::getSolutionSubmit()
	 */
	private function getQuestionOutput($value1, $value2, $template=nil, $show_question_text=true, $htmlResults=false)
	{
		$this->prepareTemplate();
		$language = $this->getLanguage();		
		$runCode = "";
		if ($this->object->getAllowRun()) {
			$tpl = $this->plugin->getTemplate('tpl.il_as_qpl_codeqst_run_code.html');
			$tpl->setVariable("RUN_LABEL", $this->plugin->txt('run_code'));
			$tpl->setVariable("QUESTION_ID", $this->object->getId());
			$tpl->setVariable("LANGUAGE", $language);
			$tpl->setVariable("DISABLED_STATE", $language=='java'?'disabled':'');
			$runCode = $tpl->get();			
		}
		
		// fill the question output template
		// in out example we have 1:1 relation for the database field
		
		if ($template == nil) {
			$template = $this->plugin->getTemplate("tpl.il_as_qpl_codeqst_output.html");
		}

		if ($show_question_text==true){
			$questiontext = $this->object->getQuestion();
			$questiontext = $this->object->prepareTextareaOutput($questiontext, TRUE);
			$questiontext = str_replace('[code]', '<pre class="'.$language.'" usebr="no">', $questiontext);
			$questiontext = str_replace('[/code]', '</pre>', $questiontext);
			$template->setVariable("QUESTIONTEXT", $questiontext);
		} else {
			$template->setVariable("QUESTIONTEXT", "");
		}	

		$value1 = empty($value1) ? "" : ilUtil::prepareFormOutput($value1);
		$value2 = empty($value2) ? "" : ilUtil::prepareFormOutput($value2);
		if ($htmlResults) {
			$value2 = str_replace('[err]', '<span style="color:red">', $value2);
			$value2 = str_replace('[/err]', '</span>', $value2);	
		}

		//This should work, however it seems to be ignored 
		/*if ($this->isRenderPurposePrintPdf()) {
			$value1 = str_replace("\t", "  ",$value1);
			$value1 = str_replace(" ", "&nbsp;",$value1);
			$value1 = str_replace("\n", "<br />", $value1);

			$value2 = str_replace("\t", "  ",$value2);
			$value2 = str_replace(" ", "&nbsp;",$value2);
			$value2 = str_replace("\n", "<br />", $value2);
		}*/

		$html = '';
		$script = '';
		//Add Code Blocks
		for ($i=0; $i<$this->object->getNumberOfBlocks(); $i++){
			$questionID = $this->object->getId();
			$code = $this->object->getContentForBlock($i);
			$id = 'block['.$questionID.']['.$i.']';
			$type = $this->object->getTypeForBlock($i);

			$tpl = $this->plugin->getTemplate('tpl.il_as_qpl_codeqst_edit_code.html');
			$tpl->setVariable("NAME", $id);
			$tpl->setVariable("BLOCK_ID", $i);
			$tpl->setVariable("BLOCK_TYPE", $type);
			$tpl->setVariable("QUESTION_ID", $questionID);

		
			if (trim($code)==='' || $type==assCodeQuestionBlockTypes::Text) {
				$html .= '<span id="'.$id.'" data-question="'.$questionID.'">'.$code.'</span>';				
			} else if ($type==assCodeQuestionBlockTypes::StaticCode) {
				$tpl->setVariable("CONTENT", $code);
				$html .= $tpl->get();
			} else if ($type==assCodeQuestionBlockTypes::SolutionCode) {
				$tpl->setVariable("CONTENT", $code);
				$html .= $tpl->get();
			} else if ($type==assCodeQuestionBlockTypes::HiddenCode) {
				$html .= '<span id="'.$id.'" style="display:none" data-question="'.$questionID.'" data-contains-code>'.$code.'</span>';	
			} else if ($type==assCodeQuestionBlockTypes::Canvas) {
				$html .= '<canvas id="'.$id.'" data-question="'.$questionID.'" class="assCodeQuestionCanvas"></canvas>';	
				$script .= 'if (questionID==='.$questionID.' && blockID==='.$i.') {\n'.$code.'\n}';
			}
		}
		$template->setVariable("BLOCK_HTML", $html);		
		$template->setVariable("{CANVAS_SCRIPT}", $script);	 
		$template->setVariable("LANGUAGE", $language);
		$template->setVariable("RUN_CODE_HTML", $runCode);

		$template->setVariable("QUESTION_ID", $this->object->getId());
		$template->setVariable("LABEL_VALUE1", $this->plugin->txt('label_value1'));

		$template->setVariable("VALUE1", $value1);
		$template->setVariable("RESULT1", $value2);		
		$template->setVariable("MAX_LINES_VAL",$this->object->getMaxLines());
		$template->setVariable("TIMEOUT_VAL",$this->object->getTimeoutMS());

		$questionoutput = $template->get();
		return $questionoutput;
	}

	/**
	 * Get the HTML output of the question for a test
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
		include_once "./Modules/Test/classes/class.ilObjTest.php";
		if (is_null($pass))
		{
			$pass = ilObjTest::_getPass($active_id);
		}
		$solutions = $this->object->getSolutionValues($active_id, $pass);

		// there may be more tham one solution record
		// the last saved wins
		if (is_array($solutions))
		{
			foreach ($solutions as $solution)
			{
				$value1 = isset($solution["value1"]) ? $solution["value1"] : "";
				$value2 = isset($solution["value2"]) ? $solution["value2"] : "";
			}
		}

		$questionoutput = $this->getQuestionOutput($value1, $value2);		
		$pageoutput = $this->outQuestionPage("", $is_postponed, $active_id, $questionoutput);
		return $pageoutput;
	}

	
	/**
	 * Get the output for question preview
	 * (called from ilObjQuestionPoolGUI)
	 * 
	 * @param boolean	show only the question instead of embedding page (true/false)
	 */
	public function getPreview($show_question_only = FALSE, $showInlineFeedback = FALSE)
	{
		if( is_object($this->getPreviewSession()) )
		{
			$solution = $this->getPreviewSession()->getParticipantsSolution();
		}

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
		// get the solution template
		$template = $this->plugin->getTemplate("tpl.il_as_qpl_codeqst_output_solution.html");	

		// get the solution of the user for the active pass or from the last pass if allowed
		$solutions = array();
		if (($active_id > 0) && (!$show_correct_solution))
		{
			// get the answers of the user for the active pass or from the last pass if allowed
			$solutions = $this->object->getSolutionValues($active_id, $pass);

			$template->setVariable("NAME_MODIFIER", "");
		}
		else
		{
			// show the correct solution
			$solutions = array(array(
				"value1" => $this->object->getBestSolution(),
				"value2" => "..."
			));
			$template->setVariable("NAME_MODIFIER", "_SOL");
		}

		// loop through the saved values if more records exist
		// the last record wins
		// adapt this to your structure of answers
		foreach ($solutions as $solution)
		{
			$value1 = isset($solution["value1"]) ? $solution["value1"] : "";			
			$value2 = isset($solution["value2"]) ? $solution["value2"] : "";			
		}		
		
		/*if ($this->getLanguage() == "python" && $this->object->getAllowRun()) {			
			$this->tpl->addOnLoadCode('runPythonInSolution();');
		}*/
		if ( $this->object->getAllowRun() ) {			
			$this->tpl->addOnLoadCode('runInSolution("'+$this->getLanguage()+'");');			
		}
			
		if (($active_id > 0) && (!$show_correct_solution))
		{
			if ($graphicalOutput)
			{
				// copied from assNumericGUI, yet not really understood
				if($this->object->getStep() === NULL)
				{
					$reached_points = $this->object->getReachedPoints($active_id, $pass);
				}
				else
				{
					$reached_points = $this->object->calculateReachedPoints($active_id, $pass);
				}
				
				// output of ok/not ok icons for user entered solutions
				// in this example we have ony one relevant input field (points)
				// so we just need to tet the icon beneath this field
				// question types with partial answers may have a more complex output
				/*if ($this->object->getReachedPoints($active_id, $pass) == $this->object->getMaximumPoints())
				{
					$template->setCurrentBlock("icon_ok");
					$template->setVariable("ICON_OK", ilUtil::getImagePath("icon_ok.svg"));
					$template->setVariable("TEXT_OK", $this->lng->txt("answer_is_right"));
					$template->parseCurrentBlock();
				}
				else
				{
					$template->setCurrentBlock("icon_ok");
					$template->setVariable("ICON_NOT_OK", ilUtil::getImagePath("icon_not_ok.svg"));
					$template->setVariable("TEXT_NOT_OK", $this->lng->txt("answer_is_wrong"));
					$template->parseCurrentBlock();
				}*/
			}
		}		

		$questionoutput = $this->getQuestionOutput($value1, $value2, $template, $show_question_text, true);
		
		$solutiontemplate = new ilTemplate("tpl.il_as_tst_solution_output.html", TRUE, TRUE, "Modules/TestQuestionPool");
		$solutiontemplate->setVariable("SOLUTION_OUTPUT", $questionoutput);

		$feedback = ($show_feedback) ? $this->getGenericFeedbackOutput($active_id, $pass) : "";
		if (strlen($feedback)) $solutiontemplate->setVariable("FEEDBACK", $this->object->prepareTextareaOutput( $feedback, true ));

		$solutionoutput = $solutiontemplate->get();

		/*if ($this->isRenderPurposePrintPdf()) {

			$solutionoutput = str_replace("<pre", "\n<code",$solutionoutput);
			$solutionoutput = str_replace("</pre", "</code",$solutionoutput);
			$solutionoutput = str_replace("\t", "  ",$solutionoutput);
			$solutionoutput = str_replace(" ", "&nbsp;",$solutionoutput);
		}*/		

		//include everything we need to execute python code when we just want to display a brief answer
		if ($_GET['cmd'] == 'getAnswerDetail' ) {
			$lngData = $this->getLanguageData();
			$solutionoutput .= '
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/lib/codemirror.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/solarized.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/base16-dark.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/base16-light.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/xq-dark.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/xq-light.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/blackboard.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/neo.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/codemirror/theme/midnight.css" media="screen" />
			<link rel="stylesheet" type="text/css" href="'.self::URL_PATH.'/js/highlight.js/styles/solarized-light.css" media="screen" />
			
			<script type="text/javascript" src="./Services/jQuery/js/2_2_4/jquery-min.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="./Services/jQuery/js/ui_1_12_0/jquery-ui-min.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/skulpt/skulpt.min.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/skulpt/skulpt-stdlib.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/lib/codemirror.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/python/python.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/clike/clike.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/fortran/fortran.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/java/java.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/javascript/javascript.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/perl/perl.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/r/r.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/mode/ruby/ruby.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/codemirror/addon/edit/closebrackets.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/highlight.js/highlight.pack.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript" src="'.self::URL_PATH.'/js/helper.js'.self::URL_SUFFIX.'"></script>
			<script type="text/javascript">runPythonInSolution();hljs.configure({useBR: false});$("pre[class='.$lngData['hljsLanguage'].'][usebr=no]").each(function(i, block) { hljs.highlightBlock(block);});</script>';
		}
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
	 * @param integer $active_id Active ID of the user
	 * @param integer $pass Active pass
	 * @return string HTML Code with the answer specific feedback
	 * @access public
	 */
	function getSpecificFeedbackOutput($active_id, $pass)
	{
		// By default no answer specific feedback is defined
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

	public function createCodeEditorFormInput(\ilPropertyFormGUI $form, $name, $value, $blockID=-1, $blockType=1){
		$item = new ilCustomInputGUI('');
		//$item->setInfo($this->plugin->txt($name.'_info'));
		$tpl = $this->plugin->getTemplate('tpl.il_as_qpl_codeqst_edit_code.html');
		$tpl->setVariable("CONTENT", ilUtil::prepareFormOutput($value));
		$tpl->setVariable("NAME", $name);
		$tpl->setVariable("BLOCK_ID", $blockID);
		$tpl->setVariable("BLOCK_TYPE", $blockType);
		$tpl->setVariable("QUESTION_ID", $this->object->getId());
		$item->setHTML($tpl->get());
		$form->addItem($item);
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

		// Add Source Code Type Selection
		// first complete scripts for codemirror
		$language = $this->getLanguage();		
		$select = new ilSelectInputGUI($this->plugin->txt('source_lang'), 'source_lang');
        $select->setOptions(array(
			'c'=>'C', 
			'c++'=>'C++',
			'c#' => 'C#', 
			'fortran'=>'Fortran', 
			'java'=>'Java',
			'javascript'=>'JavaScript',
			'objectivec'=>'Objective-C',
			'perl'=>'Perl',
			'python'=>'Python',
			'r' => 'R', 
			'ruby'=>'Ruby')
			);
		$select->addCustomAttribute('onchange="selectLanguage( )"');
		$select->setValue($this->getLanguage());
		$select->setInfo($this->plugin->txt('source_lang_info'));
		$form->addItem($select);

		$allowRun = new ilCheckboxInputGUI($this->plugin->txt('allow_run'), 'allow_run');
		$allowRun->setInfo($this->plugin->txt('allow_run_info'));	
		$allowRun->setChecked( $this->object->getAllowRun() );
		if ($this->getLanguage() == 'javascript' || $this->getLanguage() == 'python' || $this->getLanguage() == 'java') {
			$allowRun->setValue('true');
		} else {
			$allowRun->setValue('false');
		}
		$form->addItem($allowRun);

		$id = 'timeout_ms-question'.$this->object->getId().'value1';
		$runtime = new ilNumberInputGUI($this->plugin->txt('timeout_ms'),$id);	
		$runtime->setInfo($this->plugin->txt('timeout_ms_info'));
		$runtime->setSize(5);
		$runtime->setMinValue(500);
		$runtime->allowDecimals(0);
		//$runtime->setRequired(true);
		$runtime->setValue($this->object->getTimeoutMS());
		$form->addItem($runtime);

		$id = 'max_lines-question'.$this->object->getId().'value1';
		$maxLines = new ilNumberInputGUI($this->plugin->txt('max_lines'),$id);	
		$maxLines->setInfo($this->plugin->txt('max_line_infos'));
		$maxLines->setSize(5);
		$maxLines->setMinValue(20);
		$maxLines->allowDecimals(0);
		//$runtime->setRequired(true);
		$maxLines->setValue($this->object->getMaxLines());
		$form->addItem($maxLines);

		$selectTheme = new ilSelectInputGUI($this->plugin->txt('cm_theme'), 'cm_theme');
		$selectTheme->setOptions(array(
			'default' => 'default',
			'base16-dark' => 'base16-dark',
			'base16-light' => 'base16-light',
			'xq-light' => 'xq-light',
			'xq-dark' => 'xq-dark',
			'blackborard' => 'blackboard',
			'midnight' => 'midnight',
			'neo' => 'neo',
			'solarized light' => 'solarized light'
		));
		$selectTheme->addCustomAttribute('onchange="selectTheme()"');
		$selectTheme->setValue('solarized light');
		$selectTheme->setInfo($this->plugin->txt('cm_theme_info'));
		$form->addItem($selectTheme);

		$item = new ilCustomInputGUI($this->plugin->txt('cq_blocks'));
		$item->setInfo($this->plugin->txt('cq_blocks_info'));
		$form->addItem($item);

		for ($i=0; $i<$this->object->getNumberOfBlocks(); $i++){
			$elname = 'block['.$i.']';
			$selectType = new ilSelectInputGUI('', 'block_type_'.$i);
			$selectType->setOptions(array(
				assCodeQuestionBlockTypes::Text => $this->plugin->txt('plain_text'),
				assCodeQuestionBlockTypes::StaticCode => $this->plugin->txt('static_code'),
				assCodeQuestionBlockTypes::HiddenCode => $this->plugin->txt('hidden_code'),
				assCodeQuestionBlockTypes::SolutionCode => $this->plugin->txt('solution_code'),
				assCodeQuestionBlockTypes::Canvas => $this->plugin->txt('canvas')
			));
			$selectType->addCustomAttribute('onchange="selectType(this, \''.$elname.'\', '.$i.')"');
			$selectType->setValue($this->object->getTypeForBlock($i));
			$form->addItem($selectType);
			$this->createCodeEditorFormInput($form, $elname, $this->object->getContentForBlock($i), $i, $this->object->getTypeForBlock($i));
		}

		//$this->prepareTemplate();
		$language = $this->getLanguage();	
		$tpl = $this->plugin->getTemplate('tpl.il_as_qpl_codeqst_run_code.html');
		$tpl->setVariable("RUN_LABEL", $this->plugin->txt('run_code'));
		$tpl->setVariable("QUESTION_ID", $this->object->getId());
		$tpl->setVariable("LANGUAGE", 'codeqst_edit_mode');

		$item = new ilCustomInputGUI(" ");
		$item->setInfo(" ");
		$item->setHTML($tpl->get());

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
		// Here you can write the question type specific values
		$this->object->setPoints((int) $_POST["points"]);
		$this->object->setLanguage((string) $_POST["source_lang"]);
		$this->object->setTimeoutMS((int) $_POST["timeout_ms-question".$this->object->getId().'value1']);
		$this->object->setMaxLines((int) $_POST["max_lines-question".$this->object->getId().'value1']);

		$this->object->setAllowRun(((string) $_POST["allow_run"])=='true');
		$this->object->clearBlocks();
		$i = 0;
		foreach($_POST["block"] as $k=>$c){
			$t = $_POST['block_type_'.$k];
			$this->object->setTypeForBlock($i, $t);
			$this->object->setContentForBlock($i, $c);
			$i = $i + 1;
		}
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
		return array();
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
		return array();
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
		return isset($_GET['pdf']) && $_GET['pdf'];
	}
}
?>
