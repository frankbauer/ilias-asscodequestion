<?php

include_once "./Modules/TestQuestionPool/classes/class.ilQuestionsPlugin.php";

/**
* Question plugin Example
*
* @author Frank Bauer <frank.bauer@fau.de>
* @version $Id$
* @ingroup ModulesTestQuestionPool
*/
class ilassCodeQuestionPlugin extends ilQuestionsPlugin
{
		final function getPluginName():string
		{
			return "assCodeQuestion";
		}
		
		final function getQuestionType():string
		{
			return "assCodeQuestion";
		}
		
		final function getQuestionTypeTranslation():string
		{
			return $this->txt($this->getQuestionType());
		}
}
?>