<?php

/**
 * Class for accounting question import
 *
 * @author	Frank Bauer <fred.neumann@fim.unierlangen.de>
 * @version	$Id: $
 * @ingroup 	ModulesTestQuestionPool
 */
class assCodeQuestionImport extends assQuestionImport {
	/**
	 * Creates a question from a QTI file
	 *
	 * Receives parameters from a QTI parser and creates a valid ILIAS question object
	 *
	 * @param object $item The QTI item object
	 * @param integer $questionpool_id The id of the parent questionpool
	 * @param integer $tst_id The id of the parent test if the question is part of a test
	 * @param object $tst_object A reference to the parent test object
	 * @param integer $question_counter A reference to a question counter to count the questions of an imported question pool
	 * @param array $import_mapping An array containing references to included ILIAS objects
	 * @access public
	 */
	function fromXML(
		string $importdirectory,
		int $user_id,
		ilQTIItem $item,
		int $questionpool_id,
		?int $tst_id,
		?ilObject &$tst_object,
		int &$question_counter,
		array $import_mapping
	): array {
		global $DIC;

		$ilLog = $DIC->logger()->root();

		// empty session variable for imported xhtml mobs
		ilSession::clear('import_mob_xhtml');

		$presentation = $item->getPresentation();
		//$duration = $item->getDuration();
		$now = getdate();
		$created = sprintf("%04d%02d%02d%02d%02d%02d", $now['year'], $now['mon'], $now['mday'], $now['hours'], $now['minutes'], $now['seconds']);

		// get the generic feedbach
		$feedbacksgeneric = array();
		if (isset($item->itemfeedback)) {
			foreach ($item->itemfeedback as $ifb) {
				if (strcmp($ifb->getIdent(), "response_allcorrect") == 0) {
					// found a feedback for the identifier
					if (count($ifb->material)) {
						foreach ($ifb->material as $material) {
							$feedbacksgeneric[1] = $material;
						}
					}
					if ((count($ifb->flow_mat) > 0)) {
						foreach ($ifb->flow_mat as $fmat) {
							if (count($fmat->material)) {
								foreach ($fmat->material as $material) {
									$feedbacksgeneric[1] = $material;
								}
							}
						}
					}
				} else if (strcmp($ifb->getIdent(), "response_onenotcorrect") == 0) {
					// found a feedback for the identifier
					if (count($ifb->material)) {
						foreach ($ifb->material as $material) {
							$feedbacksgeneric[0] = $material;
						}
					}
					if ((count($ifb->flow_mat) > 0)) {
						foreach ($ifb->flow_mat as $fmat) {
							if (count($fmat->material)) {
								foreach ($fmat->material as $material) {
									$feedbacksgeneric[0] = $material;
								}
							}
						}
					}
				}
			}
		}

		// set question properties
		$this->addGeneralMetadata($item);
		$this->object->setTitle($item->getTitle());
		$this->object->setNrOfTries((int) $item->getMaxattempts());
		$this->object->setComment($item->getComment());
		$this->object->setAuthor($item->getAuthor());
		$this->object->setOwner($user_id);
		$this->object->setQuestion($this->QTIMaterialToString($item->getQuestiontext()));
		$this->object->setObjId($questionpool_id);
		$this->object->setPoints((float) $item->getMetadataEntry("POINTS"));
		$this->object->blocks()->updateWithJSONEncodedAdditionalData($item->getMetadataEntry("ADDITIONAL_DATA"));
		// additional content editing mode information
		$this->object->setAdditionalContentEditingMode(
			$this->fetchAdditionalContentEditingModeInformation($item)
		);

		// first save the question to get a new question id
		$this->object->saveToDb();
		$this->importSuggestedSolutions($this->object->getId(), $item->suggested_solutions);


		// convert the generic feedback
		foreach ($feedbacksgeneric as $correctness => $material) {
			$m = $this->QTIMaterialToString($material);
			$feedbacksgeneric[$correctness] = $m;
		}

		// handle the import of media objects in XHTML code
		$questiontext = $this->object->getQuestion();
		if (is_array(ilSession::get("import_mob_xhtml"))) {
			foreach (ilSession::get("import_mob_xhtml") as $mob) {
				$importfile = $importdirectory . DIRECTORY_SEPARATOR . $mob["uri"];
				$ilLog->write("Importing File: " . $importfile . " (" . basename($importfile) . ")");

				try {
					$media_object = ilObjMediaObject::_saveTempFileAsMediaObject(basename($importfile), $importfile, false);
					ilObjMediaObject::_saveUsage($media_object->getId(), "qpl:html", $this->object->getId());

					// images in question text
					$questiontext = str_replace("src=\"" . $mob["mob"] . "\"", "src=\"" . "il_" . IL_INST_ID . "_mob_" . $media_object->getId() . "\"", $questiontext);

					// images in feedback
					foreach ($feedbacksgeneric as $correctness => $material) {
						$feedbacksgeneric[$correctness] = str_replace("src=\"" . $mob["mob"] . "\"", "src=\"" . "il_" . IL_INST_ID . "_mob_" . $media_object->getId() . "\"", $material);
					}
				} catch (Exception $e) {
					$ilLog->write("Error importing file: " . $importfile . " (" . $e->getMessage() . ")", $ilLog->ERROR);
				}
			}
		}

		$this->object->setQuestion(ilRTE::_replaceMediaObjectImageSrc($questiontext ?? "", 1));
		foreach ($feedbacksgeneric as $correctness => $material) {
			$this->object->feedbackOBJ->importGenericFeedback(
				$this->object->getId(),
				$correctness,
				ilRTE::_replaceMediaObjectImageSrc($material ?? "", 1)
			);
		}

		// Now save the question again
		$this->object->saveToDb();

		// import mapping for tests
		$import_mapping[$item->getIdent()] = $this->addQuestionToParentObjectAndBuildMappingEntry(
			$questionpool_id,
			$tst_id,
			$question_counter,
			$tst_object
		);

		return $import_mapping;
	}
}

?>