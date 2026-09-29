<?php

use ILIAS\TestQuestionPool\Questions\QuestionAutosaveable;
use ILIAS\Test\Logging\AdditionalInformationGenerator;

abstract class assCodeQuestionBlockTypes {
	const Text = 0;
	const StaticCode = 1;
	const SolutionCode = 2;
	const HiddenCode = 3;
	const Canvas = 4;
	const Blockly = 5;
	const REPL = 6;
	const Data = 7;
	const Library = 8;
}

/**
 * Example class for question type plugins
 *
 * @author	Frank Bauer <frank.bauer@fau.de>
 * @version	$Id:  $
 * @ingroup ModulesTestQuestionPool
 */
class assCodeQuestion extends assQuestion implements ilObjQuestionScoringAdjustable, ilObjAnswerScoringAdjustable, QuestionAutosaveable {
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
		string $title = "",
		string $comment = "",
		string $author = "",
		int $owner = -1,
		string $question = ""
	) {
		parent::__construct($title, $comment, $author, $owner, $question);
		// needed for excel export
		$this->getPlugin()->loadLanguageModule();
		$this->blocks = new codeBlocks($this->getPlugin(), null, $question);
	}

	public static function initPluginObject(string $plugin_name): ilPlugin|null {
		global $DIC;
		$ilLog = $DIC->logger()->root();

		try {
			$component_repository = $DIC["component.repository"];
			$component_factory = $DIC["component.factory"];
			$info = $component_repository->getPluginByName($plugin_name);

			$plugin_obj = $component_factory->getPlugin($info->getId());

			if (!is_null($info) && $info->isActive()) {
				return $plugin_obj;
			} else {
				throw new ilPluginException($plugin_name . ' plugin is not active');
			}
		} catch (ilPluginException $e) {
			$ilLog->write("Error loading Plugin " . $plugin_name . ": " . $e->getMessage(), $ilLog->ERROR);
		}

		return null;
	}

	/**
	 * Get the plugin object
	 *
	 * @return object The plugin object
	 */
	public function getPlugin() {
		global $DIC;
		if ($this->plugin == null) {
			$component_factory = $DIC["component.factory"];
			$this->plugin = $component_factory->getPlugin('codeqst');

		}
		return $this->plugin;
	}

	/**
	 * Load plugin settings and return.
	 * The method will cache the results, so changes to the DB after the first get are not reflected!
	 */
	var $_settings = NULL;
	/*public function getSettings(){
			if ($this->_settings == NULL){
				$this->plugin->includeClass("class.ilassCodeQuestionConfigGUI.php");	
				$this->_settings = ilassCodeQuestionConfigGUI::loadSettings();
			}
			return $this->_settings;
		}*/

	public function blocks() {
		return $this->blocks;
	}

	/**
	 * Returns true, if the question is complete
	 *
	 * @return boolean True, if the question is complete for use, otherwise false
	 */
	public function isComplete(): bool {
		// Please add here your own check for question completeness
		// The parent function will always return false
		if (($this->title) and ($this->author) and ($this->question) and ($this->getMaximumPoints() > 0)) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Saves a question object to a database
	 * 
	 * @param	int		original id
	 * @access 	public
	 * @see assQuestion::saveToDb()
	 */
	function saveToDb(?int $original_id = null): void {
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

	public function saveAdditionalQuestionDataToDb() {
		$ilDB = $this->db;

		// Now you can save additional data
		// save data to DB
		$ilDB->replace(
			'il_qpl_qst_codeqst_dat',
			array(
				'question_fi' => array('integer', $ilDB->quote($this->getId(), 'integer'))
			),
			array(
				'question_fi' => array('integer', $ilDB->quote($this->getId(), 'integer')),
				'data' => array('clob', $this->blocks->getJSONEncodedAdditionalData())
			)
		);
	}

	public function saveAnswerSpecificDataToDb() {
	}

	/**
	 * Loads a question object from a database
	 * This has to be done here (assQuestion does not load the basic data)!
	 *
	 * @param integer $question_id A unique key which defines the question in the database
	 * @see assQuestion::loadFromDb()
	 */
	public function loadFromDb(int $question_id): void {
		$ilDB = $this->db;

		// load the basic question data
		$result = $ilDB->query("SELECT qpl_questions.* FROM qpl_questions WHERE question_id = "
			. $ilDB->quote($question_id, 'integer'));

		$data = $ilDB->fetchAssoc($result);
		$this->setId($question_id);
		$this->setTitle($data["title"] ?? "");
		$this->setComment($data["description"] ?? "");
		//TODO: Find how this is done in ilias 9
		//$this->setSuggestedSolution($data["solution_hint"]);
		$this->setOriginalId($data["original_id"]);
		$this->setObjId((int) $data["obj_fi"]);
		$this->setAuthor($data["author"] ?? "");
		$this->setOwner((int) $data["owner"]);
		$this->setPoints((float) ($data["points"] ?? 1));
		$this->setNrOfTries((int) ($data["nr_of_tries"] ?? 0));
		try {
			$this->setLifecycle(ilAssQuestionLifecycle::getInstance($data['lifecycle']));
		} catch (ilTestQuestionPoolInvalidArgumentException $e) {
			$this->setLifecycle(ilAssQuestionLifecycle::getDraftInstance());
		}
		try {
			$this->setAdditionalContentEditingMode($data['add_cont_edit_mode']);
		} catch (ilTestQuestionPoolException $e) {
		}

		$this->setQuestion(ilRTE::_replaceMediaObjectImageSrc($data["question_text"] ?? "", 1));
		//TODO: Find how this is done in ilias 9
		//$this->setEstimatedWorkingTime(substr($data["working_time"], 0, 2), substr($data["working_time"], 3, 2), substr($data["working_time"], 6, 2));

		// now you can load additional data
		$result = $ilDB->query(
			"SELECT d.data FROM il_qpl_qst_codeqst_dat d"
			. " WHERE d.question_fi ="
			. $ilDB->quote($question_id, 'integer')
		);

		$data = $ilDB->fetchAssoc($result);
		$this->loadDataToBlocks($data, $question_id);

		// loads additional stuff like suggested solutions
		parent::loadFromDb($question_id);
	}

	function loadDataToBlocks($data, $question_id) {
		$this->blocks = new codeBlocks($this->getPlugin(), $data["data"] ?? [], $question_id);
	}

	function createBlocksFromPost($P, $question_id) {

		$this->blocks = new codeBlocks($this->getPlugin(), null, $question_id);
		// echo $question_id." ".$this->blocks->getID()."<br><br>";
		// print_r($P);
		// die;
		$this->blocks->setFromPOST($P);
	}



	/**
	 * Synchronize a question with its original
	 * You need to extend this function if a question has additional data that needs to be synchronized
	 * 
	 * @access public
	 */
	function syncWithOriginal(): void {
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
	protected function getSolutionSubmit() {
		$body = $this->http->request()->getParsedBody();
		$data = $body['block'][$this->getId()] ?? [];

		$result = array();
		for ($i = 0; $i < $this->blocks->getNumberOfBlocks(); $i++) {
			if ($this->blocks[$i]->getType() == assCodeQuestionBlockTypes::SolutionCode) {
				$result[$i] = $data[$i] ?? '';
			}
		}
		return array(
			'value1' => $this->decodeSolution($result),
			'value2' => ''
		);
	}

	private function buildInitialSolution($ridIn = -1) {
		$ct = count($this->blocks()->getRandomizerSets());
		$rid = ($ridIn < 0) ? (($ct > 0) ? random_int(0, $ct - 1) : 0) : $ridIn;
		$state = array(
			"storageUUID" => $this->blocks()->getStorageUUID(),
			"rid" => $rid,
			"blocks" => $this->blocks()->getRandomBlocks($rid)
		);

		$initialSolution = array();
		for ($i = 0; $i < $this->blocks()->getNumberOfBlocks(); $i++) {
			if ($this->blocks()[$i]->getType() == assCodeQuestionBlockTypes::SolutionCode) {
				$initialSolution[$i] = $state["blocks"][$i];
			}
		}

		return array(
			'value1' => $this->decodeSolution($initialSolution),
			'value2' => $this->decodeSolution($state)
		);
	}

	public function getPreviewValuesOrInit($previewSession, $init_solution = false, $inPreview = false) {
		$solution = array();
		if (is_object($previewSession)) {
			$solution = (array) $previewSession->getParticipantsSolution();
			if (isset($solution['value2']) && (!isset($solution['value2']->rid) || $solution['value2']->storageUUID != $this->blocks()->getStorageUUID())) {
				$solution = array();
			}
		}

		if ($init_solution && count($solution) == 0) {
			if (is_object($previewSession)) {
				$res = $this->buildInitialSolution($inPreview ? $this->blocks->getRandomizerPreviewIndex() : -1);
				$previewSession->setParticipantsSolution($res);
			} else {
				$res = $this->buildInitialSolution($inPreview ? $this->blocks->getRandomizerPreviewIndex() : -1);
			}
			return $res;
		}

		return $solution;
	}

	public function getSolutionValuesOrInit($active_id, $pass, $authorized, $init_solution = false, $save = true) {
		if ($pass < 0) {
			$pass = $this->getSolutionMaxPass($active_id);
		}

		// other calls should explictly indicate whether to use the authorized or intermediate solutions			
		$rows = $this->getSolutionValues($active_id, $pass, $authorized);

		if ($init_solution && count($rows) == 0) {
			$res = $this->buildInitialSolution();
			$value1 = $res['value1'];
			$value2 = $res['value2'];
			if ($save) {
				$this->saveCurrentSolution($active_id, $pass, 'TState', json_encode($value2), true);
			}
			return $res;
		} else {
			return $this->solutionRowsToValues($rows);
		}
	}

	/**
	 * Converts the stored tst_solutions rows (TSolution / TState records) into the
	 * array('value1' => answers, 'value2' => state) structure used throughout the plugin
	 */
	public function solutionRowsToValues(array $rows): array {
		$value1 = '';
		$value2 = new \stdClass();

		foreach ($rows as $solution) {
			$v1 = isset($solution["value1"]) ? $solution["value1"] : '{}';
			$v2 = isset($solution["value2"]) ? $solution["value2"] : '{}';
			$f = strlen($v1) > 0 ? $v1[0] : '';
			if ($f != 'T') { //original style
				$value1 = $this->decodeSolution($v1);
				$value2 = $this->decodeSolution('{}');
			} else if ($v1 == 'TSolution') {
				$value1 = $this->decodeSolution($v2);
			} else if ($v1 == 'TState') {
				$value2 = $this->decodeSolution($v2);
			}
		}

		return array('value1' => $value1, 'value2' => $value2);
	}

	/**
	 * Calculate the reached points from a solution array
	 *
	 * @param	array	('value1' => string)
	 * @return  float	reached points
	 */
	protected function calculateReachedPointsForSolution($solution): float {
		// in our example we take the points entered by the student
		// and adjust them to be in the allowed range
		$points = 0.0;
		if (empty($points) or $points < 0 or $points > $this->getMaximumPoints()) {
			$points = 0.0;
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
	function calculateReachedPoints(int $active_id, ?int $pass = null, bool $authorizedSolution = true): float {
		if ($pass === null || $pass < 0) {
			$pass = $this->getSolutionMaxPass($active_id);
		}

		// get the answers of the learner from the tst_solution table
		// the data is saved by saveWorkingData() in this class
		$solutions = $this->getSolutionValuesOrInit($active_id, $pass, $authorizedSolution, false);

		// there may be more solutions stored due to race conditions
		// the last saved solution record wins
		return $this->calculateReachedPointsForSolution($solutions);
	}

	private function mylog($s) {
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
	function saveWorkingData(int $active_id, ?int $pass = null, bool $authorized = true): bool {
		if ($pass === null || $pass < 0) {
			$pass = ilObjTest::_getPass($active_id);
		}

		// get the submitted solution
		$solution = $this->getSolutionSubmit();

		//interested in randomized values, which are allways authorized
		$initialSolution = $this->getSolutionValuesOrInit($active_id, $pass, true, true, false);

		$solution['value1'] = json_encode($solution['value1']);
		$solution['value2'] = json_encode($initialSolution['value2']);

		$this->getProcessLocker()->executeUserSolutionUpdateLockOperation(function () use ($solution, $active_id, $pass, $authorized) {
			$this->removeCurrentSolution($active_id, $pass, $authorized);
			$this->saveCurrentSolution($active_id, $pass, 'TSolution', $solution['value1'], true/*$authorized*/);
		});

		return true;
	}

	/**
	 * Calculate the points a user has reached in a preview session
	 * @param ilAssQuestionPreviewSession $previewSession
	 * @return float
	 */
	public function calculateReachedPointsFromPreviewSession(ilAssQuestionPreviewSession $preview_session) {
		return 0.0;
	}


	/**
	 * Remove the current user solution
	 * Overwritten to keep the stored randomization
	 *
	 * @inheritdoc
	 */
	public function removeCurrentSolution(int $active_id, int $pass, bool $authorized = true): int {
		$ilDB = $this->db;
		if ($this->getStep() !== NULL) {
			$query = "
				DELETE FROM tst_solutions
				WHERE active_fi = %s
				AND question_fi = %s
				AND pass = %s
				AND step = %s
				AND authorized = %s
				AND value1 <> 'TState'
			";
			return $ilDB->manipulateF(
				$query,
				array('integer', 'integer', 'integer', 'integer', 'integer'),
				array($active_id, $this->getId(), $pass, $this->getStep(), (int) $authorized)
			);
		} else {
			$query = "
				DELETE FROM tst_solutions
				WHERE active_fi = %s
				AND question_fi = %s
				AND pass = %s
				AND authorized = %s
				AND value1 <> 'TState'
			";
			return $ilDB->manipulateF(
				$query,
				array('integer', 'integer', 'integer', 'integer'),
				array($active_id, $this->getId(), $pass, (int) $authorized)
			);
		}
	}
	/**
	 * Remove authorized and intermediate solution for a user in the test pass
	 * Overwritten to keep the stored randomization
	 *
	 * @inheritdoc
	 */
	public function removeExistingSolutions(int $activeId, int $pass): int {
		$ilDB = $this->db;
		$query = "
			DELETE FROM tst_solutions
			WHERE active_fi = %s
			AND question_fi = %s
			AND pass = %s
			AND value1 <> 'TState'
		";
		if ($this->getStep() !== NULL) {
			$query .= " AND step = " . $ilDB->quote((int) $this->getStep(), 'integer') . " ";
		}
		return $ilDB->manipulateF(
			$query,
			array('integer', 'integer', 'integer'),
			array($activeId, $this->getId(), $pass)
		);
	}
	/**
	 * Lookup if an authorized or intermediate solution exists
	 * Overwritten to keep the stored randomization
	 *
	 * @inheritdoc
	 */
	public function lookupForExistingSolutions(int $activeId, int $pass): array {
		$ilDB = $this->db;
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
		if ($this->getStep() !== NULL) {
			$query .= " AND step = " . $ilDB->quote((int) $this->getStep(), 'integer') . " ";
		}
		$query .= "
			GROUP BY authorized
		";
		$result = $ilDB->queryF($query, array('integer', 'integer', 'integer'), array($activeId, $this->getId(), $pass));

		while ($row = $ilDB->fetchAssoc($result)) {
			if ($row['authorized']) {
				$return['authorized'] = $row['cnt'] > 0;
			} else {
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
	public function getQuestionType(): string {
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
	public function getAdditionalTableName(): string {
		return 'il_qpl_qst_codeqst_dat';
	}


	/**
	 * Collects all text in the question which could contain media objects
	 * which were created with the Rich Text Editor
	 */
	function getRTETextWithMediaObjects(): string {
		$text = parent::getRTETextWithMediaObjects();

		// eventually add the content of question type specific text fields
		// ..

		return $text;
	}


	/*-----------------*/
	/* Logging / Export */
	/*-----------------*/

	public function toLog(AdditionalInformationGenerator $additional_info): array {
		return [
			AdditionalInformationGenerator::KEY_QUESTION_TYPE => (string) $this->getQuestionType(),
			AdditionalInformationGenerator::KEY_QUESTION_TITLE => $this->getTitleForHTMLOutput(),
			AdditionalInformationGenerator::KEY_QUESTION_TEXT => $this->formatSAQuestion($this->getQuestion()),
			AdditionalInformationGenerator::KEY_QUESTION_REACHABLE_POINTS => $this->getPoints(),
			AdditionalInformationGenerator::KEY_FEEDBACK => [
				AdditionalInformationGenerator::KEY_QUESTION_FEEDBACK_ON_INCOMPLETE => $this->formatSAQuestion($this->feedbackOBJ->getGenericFeedbackTestPresentation($this->getId(), false)),
				AdditionalInformationGenerator::KEY_QUESTION_FEEDBACK_ON_COMPLETE => $this->formatSAQuestion($this->feedbackOBJ->getGenericFeedbackTestPresentation($this->getId(), true))
			]
		];
	}

	protected function solutionValuesToLog(AdditionalInformationGenerator $additional_info, array $solution_values): string {
		return $this->solutionValuesToText($solution_values);
	}

	public function solutionValuesToText(array $solution_values): string {
		if (count($solution_values) == 0) {
			return '';
		}
		return $this->getJustAnswers($this->solutionRowsToValues($solution_values));
	}

	public function getCorrectSolutionForTextOutput(int $active_id, int $pass): array|string {
		$stored = $this->getSolutionValuesOrInit($active_id, $pass, true, false, false);
		$rid = isset($stored['value2']->rid) ? $stored['value2']->rid : -1;
		return $this->getJustAnswers(array(
			'value1' => $this->blocks()->getBestRandomSolution($rid),
			'value2' => $stored['value2']
		));
	}

	/*-----------------*/
	/* EST Integration */
	/*-----------------*/

	function getExportExtension() {
		$language = $this->blocks->getLanguage();
		if ($language == 'c')
			return 'c';
		if ($language == 'c++')
			return 'cpp';
		if ($language == 'c#')
			return 'cs';
		if ($language == 'fortran')
			return 'f';
		if ($language == 'glsl')
			return 'glsl';
		if ($language == 'java')
			return 'java';
		if ($language == 'java2')
			return 'java';
		if ($language == 'javascript')
			return 'js';
		if ($language == 'objectivec')
			return 'm';
		if ($language == 'perl')
			return 'pl';
		if ($language == 'python')
			return 'py';
		if ($language == 'python3')
			return 'py';
		if ($language == 'r')
			return 'r';
		if ($language == 'ruby')
			return 'rb';

		return 'txt';
	}

	function getExportFilename($solution = NULL) {
		if (isset($this->additional_data['export_filename']) && is_string($this->additional_data['export_filename'])) {
			return $this->additional_data['export_filename'];
		} else if ($this->blocks->getLanguage() == 'java' || $this->blocks->getLanguage() == 'java2') {
			$code = $this->getBestSolution($solution);
			$code = str_replace("&#123;", "{", $code);
			preg_match("/public[ \n]*class[ \n]*([a-zA-Z_$0-9]*)[ \n]*(\{|implements|extends)/", $code, $matches, PREG_OFFSET_CAPTURE);
			$className = '';
			if (count($matches) > 1) {
				$className = trim($matches[1][0]);
			}
			if ($className == '')
				$className = 'Unbekannt';
			return $className . '.java';
		} else {
			return sprintf('Question_%09d.%s', $this->getId(), $this->getExportExtension());
		}
	}

	public function getBestSolution($solution) {
		if ($solution == NULL || !isset($solution['value2']))
			return '';

		$blocks = $this->blocks->getCombinedBlocks($solution['value2'], false);

		$res = '';
		for ($i = 0; $i < count($blocks); $i++) {
			$t = $this->blocks[$i]->getType();
			if ($t == assCodeQuestionBlockTypes::SolutionCode) {
				$res .= $this->blocks[$i]->getContent() . "\n";
			} else {
				$res .= $blocks[$i];
			}
		}
		return $res;
	}

	public function getExportSolution($active_id = NULL, $pass = -1) {
		if ($pass === null || $pass < 0) {
			$pass = $this->getSolutionMaxPass($active_id);
		}

		$solutions = $this->getSolutionValuesOrInit($active_id, $pass, true, false, false);
		$rows = $this->getSolutionValues($active_id, $pass, true);
		foreach ($rows as $solution) {
			foreach ($solution as $k => $v) {
				if ($k == "value1" || $k == "value2")
					continue;
				$solutions[$k] = $v;
			}
		}

		return $solutions;
	}

	public function decodeSolution($value) {
		$res = is_string($value) ? json_decode($value) : $value;
		if (is_array($res)) {
			$alt = new \stdClass();
			foreach ($res as $i => $val) {
				$alt->$i = $val;
			}

			return $alt;
		}
		return $res;
	}

	private function createCommentedCodeLine($str) {
		$language = $this->blocks->getLanguage();
		if ($language == 'python' || $language == 'perl' || $language == 'ruby' || $language == 'r')
			return '# ' . $str;
		if ($language == 'fortran')
			return 'c ' . $str;

		return '// ' . $str;
	}

	function getJustAnswers($solution, $trim_all = false) {
		$blocks = $this->blocks->getCombinedBlocks(
			$solution === NULL ? NULL : $solution['value2'],
			true,
			$solution === NULL ? NULL : $solution['value1']
		);

		$res = '';
		for ($i = 0; $i < count($blocks); $i++) {
			$t = $this->blocks[$i]->getType();
			if ($t == assCodeQuestionBlockTypes::SolutionCode) {
				if (isset($blocks[$i])) {
					if ($trim_all) {
						$res .= trim($blocks[$i]) . "\n";
					} else {
						$res .= $blocks[$i] . "\n";
					}
				}
			}
		}
		return $res;
	}

	public function getCompleteSource($solution, $withAnswerMarkers = false) {
		$blocks = $this->blocks->getCombinedBlocks($solution['value2'], true, $solution['value1']);

		$res = '';
		for ($i = 0; $i < count($blocks); $i++) {
			$t = $this->blocks[$i]->getType();
			if ($t == assCodeQuestionBlockTypes::SolutionCode) {
				if ($withAnswerMarkers) {
					$res .= $this->createCommentedCodeLine("---------- START: ANSWER ----------") . "\n";
				}
				if (isset($blocks[$i])) {
					$res .= $blocks[$i] . "\n";
				}
				if ($withAnswerMarkers) {
					$res .= $this->createCommentedCodeLine("---------- END: ANSWER ----------") . "\n";
				}
			} else if ($t == assCodeQuestionBlockTypes::StaticCode || $t == assCodeQuestionBlockTypes::HiddenCode) {
				$res .= $blocks[$i] . "\n";
			}
		}
		return $res;
	}

	public function getAnswerTableName(): string {
		return "il_qpl_qst_codeqst_dat";
	}

	public function getTitle(): string {
		return $this->title;
	}

	public function getComment(): string {
		return $this->comment;
	}

	public function getQuestion(): string {
		return $this->question;
	}
}

?>