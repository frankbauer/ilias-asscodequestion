<?php
require_once "./Modules/TestQuestionPool/classes/class.assQuestion.php";
require_once "./Modules/Test/classes/inc.AssessmentConstants.php";
require_once './Modules/TestQuestionPool/interfaces/interface.ilObjQuestionScoringAdjustable.php';
require_once './Modules/TestQuestionPool/interfaces/interface.ilObjAnswerScoringAdjustable.php';

abstract class assCodeQuestionBlockTypes
{
    const Text = 0;
    const StaticCode = 1;
	const SolutionCode = 2;
	const HiddenCode = 3;
	const Canvas = 4;
	const Blockly = 5;
	const REPL = 6;
	const Data = 7;
}

/**
 * Example class for question type plugins
 *
 * @author	Frank Bauer <frank.bauer@fau.de>
 * @version	$Id:  $
 * @ingroup ModulesTestQuestionPool
 */
class assCodeQuestion extends assQuestion implements ilObjQuestionScoringAdjustable, ilObjAnswerScoringAdjustable
{	
	/**
	 * @var ilassCodeQuestionPlugin	The plugin object
	 */
	var $plugin = null;

	/* custom data we need to store fpr this question type. This array is serialized to json and stored in the db */
	var $additional_data = array();

	/* store the block-access objects. Data is allways stored in $additional_data, but the block-objects provide the Model for the data */
	var $blocks = null;

	/**
	 * Constructor
	 *
	 * The constructor takes possible arguments and creates an instance of the question object.
	 *
	 * @access public
	 * @see assQuestion:assQuestion()
	 */
	function __construct( 
		$title = "",
		$comment = "",
		$author = "",
		$owner = -1,
		$question = ""
		
	)
	{		
		// needed for excel export
		$this->getPlugin()->loadLanguageModule();
		$this->getPlugin()->includeClass("./support/codeBlocks.php");

		$this->blocks = new codeBlocks($this->getPlugin(), null, $question);
		parent::__construct($title, $comment, $author, $owner, $question);
	}

	/**
	 * Get the plugin object
	 *
	 * @return object The plugin object
	 */
	public function getPlugin() {
		if ($this->plugin == null)
		{
			include_once "./Services/Component/classes/class.ilPlugin.php";
			$this->plugin = ilPlugin::getPluginObject(IL_COMP_MODULE, "TestQuestionPool", "qst", "assCodeQuestion");
				
		}
		return $this->plugin;
	}

	/**
	 * Load plugin settings and return.
	 * The method will cache the results, so changes to the DB after the first get are not reflected!
	 */
	var $_settings = NULL;
	public function getSettings(){
		if ($this->_settings == NULL){
			$this->plugin->includeClass("class.ilassCodeQuestionConfigGUI.php");	
			$this->_settings = ilassCodeQuestionConfigGUI::loadSettings();
		}
		return $this->_settings;
	}

	public function blocks(){
		return $this->blocks;
	}

	/**
	 * Returns true, if the question is complete
	 *
	 * @return boolean True, if the question is complete for use, otherwise false
	 */
	public function isComplete()
	{
		// Please add here your own check for question completeness
		// The parent function will always return false
		if(($this->title) and ($this->author) and ($this->question) and ($this->getMaximumPoints() > 0))
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	/**
	 * Saves a question object to a database
	 * 
	 * @param	string		original id
	 * @access 	public
	 * @see assQuestion::saveToDb()
	 */
	function saveToDb($original_id = "")
	{
		global $ilDB;

		// save the basic data (implemented in parent)
		// a new question is created if the id is -1
		// afterwards the new id is set
		$this->saveQuestionDataToDb($original_id);
		$this->saveAdditionalQuestionDataToDb();
		$this->saveAnswerSpecificDataToDb();
		
		// save stuff like suggested solutions
		// update the question time stamp and completion status
		parent::saveToDb();
	}

	public function saveAdditionalQuestionDataToDb()
	{
		/** @var ilDBInterface $ilDB */
		global $ilDB;
		
		// Now you can save additional data
		// save data to DB
		$ilDB->replace('il_qpl_qst_codeqst_dat',
			array(
				'question_fi' => array('integer', $ilDB->quote($this->getId(), 'integer'))
			),
			array(
				'question_fi' => array('integer', $ilDB->quote($this->getId(), 'integer')),
				'data' => array('clob', $this->blocks->getJSONEncodedAdditionalData())
			)
		);
	}

	public function saveAnswerSpecificDataToDb()
	{
		/** @var ilDBInterface $ilDB */
		global $ilDB;

	}

	/**
	 * Loads a question object from a database
	 * This has to be done here (assQuestion does not load the basic data)!
	 *
	 * @param integer $question_id A unique key which defines the question in the database
	 * @see assQuestion::loadFromDb()
	 */
	public function loadFromDb($question_id)
	{
		global $ilDB;
                
		// load the basic question data
		$result = $ilDB->query("SELECT qpl_questions.* FROM qpl_questions WHERE question_id = "
				. $ilDB->quote($question_id, 'integer'));

		$data = $ilDB->fetchAssoc($result);
		$this->setId($question_id);
		$this->setTitle($data["title"]);
		$this->setComment($data["description"]);
		$this->setSuggestedSolution($data["solution_hint"]);
		$this->setOriginalId($data["original_id"]);
		$this->setObjId($data["obj_fi"]);
		$this->setAuthor($data["author"]);
		$this->setOwner($data["owner"]);
		$this->setPoints($data["points"]);

		include_once("./Services/RTE/classes/class.ilRTE.php");
		$this->setQuestion(ilRTE::_replaceMediaObjectImageSrc($data["question_text"], 1));
		$this->setEstimatedWorkingTime(substr($data["working_time"], 0, 2), substr($data["working_time"], 3, 2), substr($data["working_time"], 6, 2));

		// now you can load additional data
		$result = $ilDB->query(
			"SELECT d.data FROM il_qpl_qst_codeqst_dat d"			
			. " WHERE d.question_fi ="
			. $ilDB->quote($question_id, 'integer'));

		$data = $ilDB->fetchAssoc($result);	
		$this->loadDataToBlocks($data, $question_id);
		
		try
		{
			$this->setAdditionalContentEditingMode($data['add_cont_edit_mode']);
		}
		catch(ilTestQuestionPoolException $e)
		{
		}

		// loads additional stuff like suggested solutions
		parent::loadFromDb($question_id);
	}

	function loadDataToBlocks($data, $question_id){
		$this->blocks = new codeBlocks($this->getPlugin(), $data["data"], $question_id);
	}

	function createBlocksFromPost($P, $question_id){
		
		$this->blocks = new codeBlocks($this->getPlugin(), null, $question_id);
		// echo $question_id." ".$this->blocks->getID()."<br><br>";
		// print_r($P);
		// die;
		$this->blocks->setFromPOST($P);
	}



    public function createNewOriginalFromThisDuplicate($targetParentId, $targetQuestionTitle = ""){
        return $this->duplicate(false, $targetQuestionTitle, "", "", $targetParentId);
    }
	

	/**
	 * Duplicates a question
	 * This is used for copying a question to a test
	 *
	 * @access public
	 */
	function duplicate($for_test = true, $title = "", $author = "", $owner = "", $testObjId = null)
	{
		if ($this->getId() <= 0)
		{
			// The question has not been saved. It cannot be duplicated
			return;
		}

		// make a real clone to keep the object unchanged
		$clone = clone $this;
							
		$original_id = assQuestion::_getOriginalId($this->getId());
		$clone->setId(-1);

		if( (int) $testObjId > 0 )
		{
			$clone->setObjId($testObjId);
		}

		if ($title)
		{
			$clone->setTitle($title);
		}
		if ($author)
		{
			$clone->setAuthor($author);
		}
		if ($owner)
		{
			$clone->setOwner($owner);
		}		
		
		if ($for_test)
		{
			$clone->saveToDb($original_id, false);
		}
		else
		{
			$clone->saveToDb('', false);
		}		

		// copy question page content
		$clone->copyPageOfQuestion($this->getId());
		// copy XHTML media objects
		$clone->copyXHTMLMediaObjectsOfQuestion($this->getId());

		// call the event handler for duplication
		$clone->onDuplicate($this->getObjId(), $this->getId(), $clone->getObjId(), $clone->getId());

		return $clone->getId();
	}

	/**
	 * Copies a question
	 * This is used when a question is copied on a question pool
	 *
	 * @access public
	 */
	function copyObject($target_questionpool_id, $title = "")
	{
		if ($this->getId() <= 0)
		{
			// The question has not been saved. It cannot be duplicated
			return;
		}

		// make a real clone to keep the object unchanged
		$clone = clone $this;
				
		$original_id = assQuestion::_getOriginalId($this->getId());
		$source_questionpool_id = $this->getObjId();
		$clone->setId(-1);
		$clone->setObjId($target_questionpool_id);
		if ($title)
		{
			$clone->setTitle($title);
		}
				
		// save the clone data
		$clone->saveToDb('', false);

		// copy question page content
		$clone->copyPageOfQuestion($original_id);
		// copy XHTML media objects
		$clone->copyXHTMLMediaObjectsOfQuestion($original_id);

		// call the event handler for copy
		$clone->onCopy($source_questionpool_id, $original_id, $clone->getObjId(), $clone->getId());

		return $clone->getId();
	}

	/**
	 * Synchronize a question with its original
	 * You need to extend this function if a question has additional data that needs to be synchronized
	 * 
	 * @access public
	 */
	function syncWithOriginal()
	{
		parent::syncWithOriginal();
	}


	/**
	 * Get a submitted solution array from $_POST
	 *
	 * In general this may return any type that can be stored in a php session
	 * The return value is used by:
	 * 		savePreviewData()
	 * 		saveWorkingData()
	 * 		calculateReachedPointsForSolution()
	 *
	 * @return	array	('value1' => string)
	 */
	protected function getSolutionSubmit()
	{				
		$data = $_POST['block'][$this->getId()];

		$result = array();
		for ($i=0; $i<$this->blocks->getNumberOfBlocks(); $i++){
			if ($this->blocks[$i]->getType() == assCodeQuestionBlockTypes::SolutionCode){
				$result[$i] = $data[$i];
			}
		}
		return array(
			'value1' => $this->decodeSolution($result),
			'value2' => ''
		);
	}

	private function buildInitialSolution($ridIn=-1){
		$ct = count($this->blocks()->getRandomizerSets());
        $rid = ($ridIn<0)?(($ct>0)?random_int(0, $ct-1):0):$ridIn;
		$state = array(
			"storageUUID" => $this->blocks()->getStorageUUID(),
			"rid" => $rid,
			"blocks" => $this->blocks()->getRandomBlocks($rid)
		);

		$initialSolution = array();
		for ($i=0; $i<$this->blocks()->getNumberOfBlocks(); $i++){
			if ($this->blocks()[$i]->getType() == assCodeQuestionBlockTypes::SolutionCode){
				$initialSolution[$i] = $state["blocks"][$i];
			}
		}	
		
		return array(
			'value1' => $this->decodeSolution($initialSolution), 
			'value2' => $this->decodeSolution($state)
		);
	}

	public function getPreviewValuesOrInit($previewSession, $init_solution=false, $inPreview=false){
		$solution = array();
		if( is_object($previewSession)) {
            $solution = (array) $previewSession->getParticipantsSolution();
			if (isset($solution['value2']) && (!isset($solution['value2']->rid) || $solution['value2']->storageUUID!=$this->blocks()->getStorageUUID())){
                $solution = array();
			}
		}

		if ($init_solution && count($solution)==0){	
            if( is_object($previewSession) ) {
                $res = $this->buildInitialSolution($inPreview?$this->blocks->getRandomizerPreviewIndex():-1);
				$previewSession->setParticipantsSolution($res);				
			} else {
                $res = $this->buildInitialSolution($inPreview?$this->blocks->getRandomizerPreviewIndex():-1);
			}
			return $res;
		}

		return $solution;
	}

	public function getSolutionValuesOrInit($active_id, $pass, $authorized, $init_solution=false, $save=true){
		if($pass<0)
		{
			$pass = $this->getSolutionMaxPass($active_id);
		}

		// other calls should explictly indicate whether to use the authorized or intermediate solutions			
		$rows = $this->getSolutionValues($active_id, $pass, $authorized);
		
		if ($init_solution && count($rows)==0){
			$res = $this->buildInitialSolution();
			$value1 = $res['value1'];
			$value2 = $res['value2'];
			if ($save) {
				$this->saveCurrentSolution($active_id, $pass, 'TState', json_encode($value2), true);
			}
			return $res;
		} else {
			$value1 = '';
			$value2 = new \stdClass();;

			foreach ($rows as $solution)
			{
				$v1 = isset($solution["value1"]) ? $solution["value1"] : '{}';
				$v2 = isset($solution["value2"]) ? $solution["value2"] : '{}';
				$f = strlen($v1)>0 ? $v1[0] : '';
				if ($f!='T') { //original style
					$value1 = $this->decodeSolution($v1);
					$value2 = $this->decodeSolution('{}');
				} else if ($v1=='TSolution') {
					$value1 = $this->decodeSolution($v2);
				} else if ($v1=='TState') {
					$value2 = $this->decodeSolution($v2);
				}	
			}

			return array('value1' => $value1, 'value2' => $value2);
		}		
	}

	/**
	 * Calculate the reached points from a solution array
	 *
	 * @param	array	('value1' => string)
	 * @return  float	reached points
	 */
	protected function calculateReachedPointsForSolution($solution)
	{
		// in our example we take the points entered by the student
		// and adjust them to be in the allowed range
		$points = 0;
		if (empty($points) or $points < 0 or $points > $this->getMaximumPoints())
		{
			$points = 0;
		}

		// return the raw points given to the answer
		// these points will afterwards be adjusted by the scoring options of a test
		return $points;
	}


	/**
	 * Returns the points, a learner has reached answering the question
	 * The points are calculated from the given answers.
	 *
	 * @param integer $active 	The Id of the active learner
	 * @param integer $pass 	The Id of the test pass
	 * @param boolean $returndetails (deprecated !!)
	 * @return integer/array $points/$details (array $details is deprecated !!)
	 * @access public
	 * @see  assQuestion::calculateReachedPoints()
	 */
	function calculateReachedPoints($active_id, $pass = -1, $authorizedSolution = true, $returndetails = FALSE)
	{
		if( $returndetails )
		{
			throw new ilTestException('return details not implemented for '.__METHOD__);
		}

		if($pass<0)
		{
			$pass = $this->getSolutionMaxPass($active_id);
		}

		// get the answers of the learner from the tst_solution table
		// the data is saved by saveWorkingData() in this class
		$solutions = $this->getSolutionValuesOrInit($active_id, $pass, $authorizedSolution, false);

		// there may be more solutions stored due to race conditions
		// the last saved solution record wins
		return $this->calculateReachedPointsForSolution(empty($solutions) ? array() : end($solutions));
	}

	/**
	* Sets the points, a learner has reached answering the question
	*
	* @param integer $user_id The database ID of the learner
	* @param integer $test_id The database Id of the test containing the question
	* @param integer $points The points the user has reached answering the question
	* @return boolean true on success, otherwise false
	* @access public
	*/
	function setReachedPoints($active_id, $points, $pass = -1)
	{
		global $ilDB;
		
		if (($points > 0) && ($points <= $this->getPoints()))
		{
			if ($pass<0)
			{
				$pass = $this->getSolutionMaxPass($active_id);
			}
			$affectedRows = $ilDB->manipulateF("UPDATE tst_test_result SET points = %s WHERE active_fi = %s AND question_fi = %s AND pass = %s",
				array('float','integer','integer','integer'),
				array($points, $active_id, $this->getId(), $pass)
			);
			self::_updateTestPassResults($active_id, $pass);
			return TRUE;
		}
			else
		{
			return TRUE;
		}
	}

	private function mylog($s){
		/*$fp = fopen('/opt/iliasdata/assCodeQuestion.log', 'a');
		fwrite($fp, $s);
		fwrite($fp, '---');
		fclose($fp);*/
	}

	/**
	 * Saves the learners input of the question to the database
	 *
	 * @param 	integer $test_id The database id of the test containing this question
	 * @return 	boolean Indicates the save status (true if saved successful, false otherwise)
	 * @access 	public
	 * @see 	assQuestion::saveWorkingData()
	 */
	function saveWorkingData($active_id, $pass = -1, $authorized = true)
	{
		global $ilDB;
		global $ilUser;

		if ($pass<0)
		{
			include_once "./Modules/Test/classes/class.ilObjTest.php";
			$pass = ilObjTest::_getPass($active_id);
		}

		// get the submitted solution
		$solution = $this->getSolutionSubmit();

		//interested in randomized values, which are allways authorized
		$initialSolution = $this->getSolutionValuesOrInit($active_id, $pass, true, true, false); 

		$solution['value1'] = json_encode($solution['value1']);
		$solution['value2'] = json_encode($initialSolution['value2']);		

		$this->getProcessLocker()->executeUserSolutionUpdateLockOperation(function() use ($solution, $active_id, $pass, $authorized, $value1, $value2) {
			$this->removeCurrentSolution($active_id, $pass, $authorized);
		$this->saveCurrentSolution($active_id, $pass, 'TSolution', $solution['value1'], true/*$authorized*/);
		});
		
		// log the saving, we assume that values have been entered
		if (ilObjAssessmentFolder::_enabledAssessmentLogging())
		{
			$this->logAction($this->lng->txtlng("assessment", "log_user_entered_values", ilObjAssessmentFolder::_getLogLanguage()), $active_id, $this->getId());
		}
		return true;
	}

	/**
	 * Calculate the points a user has reached in a preview session
	 * @param ilAssQuestionPreviewSession $previewSession
	 * @return float
	 */
	public function calculateReachedPointsFromPreviewSession(ilAssQuestionPreviewSession $previewSession)
	{
        $solution = (array) $previewSession->getParticipantsSolution();
		
        return 0;
	}


	/**
	 * Reworks the already saved working data if neccessary
	 *
	 * @abstract
	 * @access protected
	 * @param integer $active_id
	 * @param integer $pass
	 * @param boolean $obligationsAnswered
	 * * @param boolean $authorized
	 */
	protected function reworkWorkingData($active_id, $pass, $obligationsAnswered, $authorized)
	{
		// nothing to rework!
	}

    /**
     * Remove the current user solution
     * Overwritten to keep the stored randomization
     *
     * @inheritdoc
     */
    public function removeCurrentSolution($active_id, $pass, $authorized = true)
    {
		global $ilDB;
        if($this->getStep() !== NULL)
        {
            $query = "
				DELETE FROM tst_solutions
				WHERE active_fi = %s
				AND question_fi = %s
				AND pass = %s
				AND step = %s
				AND authorized = %s
				AND value1 <> 'TState'
			";
            return $ilDB->manipulateF($query, array('integer', 'integer', 'integer', 'integer', 'integer'),
                array($active_id, $this->getId(), $pass, $this->getStep(), (int)$authorized)
            );
        }
        else
        {
            $query = "
				DELETE FROM tst_solutions
				WHERE active_fi = %s
				AND question_fi = %s
				AND pass = %s
				AND authorized = %s
				AND value1 <> 'TState'
			";
            return $ilDB->manipulateF($query, array('integer', 'integer', 'integer', 'integer'),
                array($active_id, $this->getId(), $pass, (int)$authorized)
            );
        }
    }
    /**
     * Remove authorized and intermediate solution for a user in the test pass
     * Overwritten to keep the stored randomization
     *
     * @inheritdoc
     */
    public function removeExistingSolutions($activeId, $pass)
    {
		global $ilDB;
        $query = "
			DELETE FROM tst_solutions
			WHERE active_fi = %s
			AND question_fi = %s
			AND pass = %s
			AND value1 <> 'TState'
		";
        if( $this->getStep() !== NULL )
        {
            $query .= " AND step = " . $ilDB->quote((int)$this->getStep(), 'integer') . " ";
        }
        return $ilDB->manipulateF($query, array('integer', 'integer', 'integer'),
            array($activeId, $this->getId(), $pass)
        );
    }
    /**
     * Lookup if an authorized or intermediate solution exists
     * Overwritten to keep the stored randomization
     *
     * @inheritdoc
     */
    public function lookupForExistingSolutions($activeId, $pass)
    {
		/** @var $ilDB \ilDBInterface  */
        global $ilDB;
        $return = array(
            'authorized' => false,
            'intermediate' => false
        );
        $query = "
			SELECT authorized, COUNT(*) cnt
			FROM tst_solutions
			WHERE active_fi = %s
			AND question_fi = %s
			AND pass = %s
			AND value1 <> 'TState'
		";
        if( $this->getStep() !== NULL )
        {
            $query .= " AND step = " . $ilDB->quote((int)$this->getStep(), 'integer') . " ";
        }
        $query .= "
			GROUP BY authorized
		";
		$result = $ilDB->queryF($query, array('integer', 'integer', 'integer'), array($activeId, $this->getId(), $pass));
		
        while ($row = $ilDB->fetchAssoc($result))
        {
            if ($row['authorized']) {
                $return['authorized'] = $row['cnt'] > 0;
            }
            else
            {
                $return['intermediate'] = $row['cnt'] > 0;
            }
		}

        return $return;
    }



	/**
	 * Returns the question type of the question
	 *
	 * @return string The question type of the question
	 */
	public function getQuestionType()
	{
		return "assCodeQuestion";
	}

	/**
	 * Returns the names of the additional question data tables
	 *
	 * all tables must have a 'question_fi' column
	 * data from these tables will be deleted if a question is deleted
	 *
	 * @return mixed 	the name(s) of the additional tables (array or string)
	 */
	public function getAdditionalTableName()
	{
		return array('il_qpl_qst_codeqst_dat');
	}

	
	/**
	 * Collects all text in the question which could contain media objects
	 * which were created with the Rich Text Editor
	 */
	function getRTETextWithMediaObjects()
	{
		$text = parent::getRTETextWithMediaObjects();

		// eventually add the content of question type specific text fields
		// ..

		return $text;
	}


	/**
	 * Creates an Excel worksheet for the detailed cumulated results of this question
	 *
	 * @access public
	 * @see assQuestion::setExportDetailsXLS()
	 */
	public function setExportDetailsXLS($worksheet, $startrow, $active_id, $pass, &$format_title='', &$format_bold='')
	{
		global $lng;

		$il52 = file_exists('./Modules/TestQuestionPool/classes/class.ilAssExcelFormatHelper.php');
		if (!$il52) {
			include_once ("./Services/Excel/classes/class.ilExcelUtils.php");
		} else {
			include_once './Modules/TestQuestionPool/classes/class.ilAssExcelFormatHelper.php';
		}

		
		$solutions = $this->getSolutionValuesOrInit($active_id, $pass, true, false);

		if ($il52){
			// also see parent::setExportDetailsXLS($worksheet, $startrow, $active_id, $pass);
			$worksheet->setFormattedExcelTitle($worksheet->getColumnCoord(0) . $startrow, $this->plugin->txt($this->getQuestionType()));
			$worksheet->setFormattedExcelTitle($worksheet->getColumnCoord(1) . $startrow, $this->getTitle());
		} else {
			$worksheet->writeString($startrow, 0, ilExcelUtils::_convert_text($this->plugin->txt($this->getQuestionType())), $format_title);
			$worksheet->writeString($startrow, 1, ilExcelUtils::_convert_text($this->getTitle()), $format_title);
		}
		$i = 1;

		// now provide a result string and write it to excel
		// it is also possible to write multiple rows
		if ($il52){
			$stringEscaping = $worksheet->getStringEscaping();
			$worksheet->setStringEscaping(false);
			$worksheet->setCell($startrow + $i, 0, $this->plugin->txt("label_value1"));
			$worksheet->setCell($startrow + $i, 1, (print_r($solutions['value1'], true)));
			$worksheet->setStringEscaping($stringEscaping);
		} else {
			$worksheet->writeString($startrow + $i, 0, ilExcelUtils::_convert_text($this->plugin->txt("label_value1")), $format_bold);
			$worksheet->write($startrow + $i, 1, ilExcelUtils::_convert_text(print_r($solutions['value1'], true)));
		}
		$i++;

		if ($il52){
			$worksheet->setCell($startrow + $i, 0, $this->plugin->txt("label_value2"));
			$worksheet->setCell($startrow + $i, 1, print_r($solutions['value2'], true));
		} else {
			$worksheet->writeString($startrow + $i, 0, ilExcelUtils::_convert_text($this->plugin->txt("label_value2")), $format_bold);
			$worksheet->write($startrow + $i, 1, ilExcelUtils::_convert_text(print_r($solutions['value2'], true)));
		}
		
		if ($il52){
			$worksheet->setCell($startrow + $i, 0, $this->plugin->txt("label_points"));
			$worksheet->setCell($startrow + $i, 1, $points);	
		} else {
			$worksheet->writeString($startrow + $i, 0, ilExcelUtils::_convert_text($this->plugin->txt("label_points")), $format_bold);
			$worksheet->write($startrow + $i, 1, ilExcelUtils::_convert_text($points));
		}
		$i++;

		return $startrow + $i + 1;
	}

	/**
	 * Creates a question from a QTI file
	 * Receives parameters from a QTI parser and creates a valid ILIAS question object
	 * Extension needed to get the plugin path for the import class
	 *
	 * @access public
	 * @see assQuestion::fromXML()
	 */
	function fromXML(&$item, &$questionpool_id, &$tst_id, &$tst_object, &$question_counter, &$import_mapping)
	{
		$this->getPlugin()->includeClass("import/qti12/class.assCodeQuestionImport.php");
		$import = new assCodeQuestionImport($this);
		$import->fromXML($item, $questionpool_id, $tst_id, $tst_object, $question_counter, $import_mapping);
	}

	/**
	 * Returns a QTI xml representation of the question and sets the internal
	 * domxml variable with the DOM XML representation of the QTI xml representation
	 * Extension needed to get the plugin path for the import class
	 *
	 * @return string The QTI xml representation of the question
	 * @access public
	 * @see assQuestion::toXML()
	 */
	function toXML($a_include_header = true, $a_include_binary = true, $a_shuffle = false, $test_output = false, $force_image_references = false)
	{
		$this->getPlugin()->includeClass("export/qti12/class.assCodeQuestionExport.php");
		$export = new assCodeQuestionExport($this);
		return $export->toXML($a_include_header, $a_include_binary, $a_shuffle, $test_output, $force_image_references);
	}

	/**
	 * returns boolean wether it is possible to set
	 * this question type as obligatory or not
	 * considering the current question configuration
	 *
	 * (overwrites method in class assQuestion)
	 *
	 * @param integer $questionId
	 * @return boolean $obligationPossible
	 */
	public static function isObligationPossible($questionId)
	{
		return true;
	}


	/*-----------------*/
	/* EST Integration */
	/*-----------------*/

	function getExportExtension() {
		$language = $this->blocks->getLanguage();
		if ($language=='c') return 'c';
		if ($language=='c++') return 'cpp';		
		if ($language=='c#') return 'cs';
		if ($language=='fortran') return 'f';
		if ($language=='glsl') return 'glsl';
		if ($language=='java') return 'java';
		if ($language=='java2') return 'java';
		if ($language=='javascript') return 'js';
		if ($language=='objectivec') return 'm';
		if ($language=='perl') return 'pl';
		if ($language=='python') return 'py';
		if ($language=='python3') return 'py';
		if ($language=='r') return 'r';
		if ($language=='ruby') return 'rb';

		return 'txt';
	}

	function getExportFilename($solution=NULL) {
		if (is_string($this->additional_data['export_filename'])) {
			return $this->additional_data['export_filename'];
		} else if ($this->blocks->getLanguage()=='java' || $this->blocks->getLanguage()=='java2'){
            $code = $this->getBestSolution($solution);
            $code = str_replace("&#123;", "{", $code);
			preg_match("/public[ \n]*class[ \n]*([a-zA-Z_$0-9]*)[ \n]*(\{|implements|extends)/", $code, $matches, PREG_OFFSET_CAPTURE);				
			$className = trim($matches[1][0]);
			if ($className=='') $className="Unbekannt";
			return $className.'.java';
		} else {
			return sprintf('Question_%09d.%s', $this->getId(), $this->getExportExtension());
		}
	}

	public function getBestSolution($solution){
		$blocks = $this->blocks->getCombinedBlocks($solution['value2'], false);
	
		$res = '';
		for ($i=0; $i<count($blocks); $i++){
			$t = $this->blocks[$i]->getType();
			if ($t == assCodeQuestionBlockTypes::SolutionCode ) { 
				$res .= $this->blocks[$i]->getContent()."\n";			
			} else {
				$res .= $blocks[$i];
			}
		}
		return $res;
	}

	public function getExportSolution($active_id=NULL, $pass=-1){
		if($pass<0){
			$pass = $this->getSolutionMaxPass($active_id);
		}

		$solutions = $this->getSolutionValuesOrInit($active_id, $pass, true, false, false);		
		$rows = $this->getSolutionValues($active_id, $pass, true);
		foreach ($rows as $solution){
			foreach ($solution as $k=>$v){
				if ($k=="value1" || $k=="value2") continue;
				$solutions[$k] = $v;
			}
		}
		
		return $solutions;
	}

	public function decodeSolution($value){
		$res = is_string($value)?json_decode($value):$value;
		if (is_array($res)){
			$alt = new \stdClass();
			foreach ($res as $i=>$val){
				$alt->$i = $val;
			}
			
			return $alt;
		}
		return $res;
	}

	private function createCommentedCodeLine($str){
		$language = $this->blocks->getLanguage();
		if ($language=='python' || $language=='perl' || $language=='ruby' || $language=='r') return '# '.$str;
		if ($language=='fortran') return 'c '.$str;				

		return '// '.$str;
	}

    function getJustAnswers($solution, $trimall=false){
        $blocks = $this->blocks->getCombinedBlocks($solution['value2'], true, $solution['value1']);
	
		$res = '';
		for ($i=0; $i<count($blocks); $i++){
			$t = $this->blocks[$i]->getType();
			if ($t == assCodeQuestionBlockTypes::SolutionCode) {
				if (isset($blocks[$i])){
                    if ($trimall){
                        $res .= trim($blocks[$i])."\n"; 
                    } else {
                        $res .= $blocks[$i]."\n";
                    }
				}				
			} 
		}
		return $res;
    }

	public function getCompleteSource($solution, $withAnswerMarkers=false){	
		$blocks = $this->blocks->getCombinedBlocks($solution['value2'], true, $solution['value1']);
	
		$res = '';
		for ($i=0; $i<count($blocks); $i++){
			$t = $this->blocks[$i]->getType();
			if ($t == assCodeQuestionBlockTypes::SolutionCode) {
				if ($withAnswerMarkers) {
					$res .= $this->createCommentedCodeLine("---------- START: ANSWER ----------")."\n";
				}
				if (isset($blocks[$i])){
					$res .= $blocks[$i]."\n";
				}
				if ($withAnswerMarkers) {
					$res .= $this->createCommentedCodeLine("---------- END: ANSWER ----------")."\n";
				}
			} else if ($t == assCodeQuestionBlockTypes::StaticCode || $t== assCodeQuestionBlockTypes::HiddenCode) {
				$res .= $blocks[$i]."\n";
			}
		}
		return $res;
	}
}

?>
