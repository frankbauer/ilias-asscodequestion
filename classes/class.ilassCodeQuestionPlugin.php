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
		final function getPluginName()
		{
			return "assCodeQuestion";
		}
		
		final function getQuestionType()
		{
			return "assCodeQuestion";
		}
		
		final function getQuestionTypeTranslation()
		{
			return $this->txt($this->getQuestionType());
		}
}
?>