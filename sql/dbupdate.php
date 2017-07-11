<#1>
<?php
/**
 * Question plugin example: database update script
 *
 * @author Frank Bauer <frank.bauer@fau.de>
 * @version $Id$
 */ 

$res = $ilDB->queryF("SELECT * FROM qpl_qst_type WHERE type_tag = %s", array('text'), array('assCodeQuestion')
);

if ($res->numRows() == 0) 
{
    $res = $ilDB->query("SELECT MAX(question_type_id) maxid FROM qpl_qst_type");
    $data = $ilDB->fetchAssoc($res);
    $max = $data["maxid"] + 1;

    $affectedRows = $ilDB->manipulateF(
		"INSERT INTO qpl_qst_type (question_type_id, type_tag, plugin) VALUES (%s, %s, %s)",
		array("integer", "text", "integer"),
		array($max, 'assCodeQuestion',
		1)
    );
}
?>
<#2>
<?php
	/*
	 * Add table for additional settings
	 *
	 */

	$fields = array(
		'question_fi' => array(
			'type' => 'integer',
			'length' => 4
		),

		'data' => array(
		'type' => 'clob'
		)
	);

	$ilDB->createTable("il_qpl_qst_codeqst_dat", $fields);
	$ilDB->addPrimaryKey("il_qpl_qst_codeqst_dat", array("question_fi"));
?>