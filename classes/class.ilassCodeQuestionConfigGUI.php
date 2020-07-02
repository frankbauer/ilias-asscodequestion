<?php
 
include_once("./Services/Component/classes/class.ilPluginConfigGUI.php");
 
/**
 * Configuration class for Code Questions
 *
 * @author	Frank Bauer <frank.bauer@fau.de>
 * @version	$Id:  $
 */
class ilassCodeQuestionConfigGUI extends ilPluginConfigGUI
{
	/**
	* Handles all commmands, default is "configure"
	*/
	function performCommand($cmd)
	{
		switch ($cmd)
		{
			case 'scfg':
				$this->storeData();
			break;
			case 'configure':	
				$this->configure();
			break;
			default:				
				break; 
		}
	}

	function storeData(){
		global $tpl, $lng, $ilCtrl, $ilDB;

		// Get plugin object for translations
		$plugin = $this->getPluginObject();
		$lng = $plugin;
	
		$pl = $this->getPluginObject();
		
		$form = $this->initConfigurationForm();
		if ($form->checkInput())
		{
			$settings = array();

			$settings['printctrlchars'] = ($form->getInput("printctrlchars") == '1');
			//
			// @todo: implement saving to db
			
			$ilDB->update("il_qpl_qst_codeqst_cfg", array(
				"config_fi" =>      array("integer", 0),
				"data" =>        	array("clob", json_encode($settings))),
				array(
					"config_fi" =>        	array("int", 0)				
				)
			);
			
			ilUtil::sendSuccess($lng->txt("config_saved"), true);
			$ilCtrl->redirect($this, "configure");
		} else {
			ilUtil::sendFailure($lng->txt("config_save_failed"));
			$form->setValuesByPost();
			$tpl->setContent($form->getHtml());
		}

		
		
	}
	/**
	 * Configure
	 *
	 * @param
	 * @return
	 */
	function configure()
	{
		global $tpl;

		$form = $this->initConfigurationForm();
		$tpl->setContent($form->getHTML());
	}

	static function loadSettings(){
		global $ilDB;

		$result = $ilDB->query("SELECT * FROM il_qpl_qst_codeqst_cfg WHERE config_fi = ".$ilDB->quote(0, "integer"));
		$record = $ilDB->fetchObject($result);
		$settings = array();
		if ($record && $record->data) {
			$settings = json_decode($record->data);	
			if (!isset($settings->printctrlchars)){
				$settings->printctrlchars = true;
			}		
		}

		return $settings;
	}



	function initConfigurationForm(){
		global $ilCtrl, $ilDB;

		$settings = ilassCodeQuestionConfigGUI::loadSettings();		

		// Get plugin object for translations
		$plugin = $this->getPluginObject();
		$lng = $plugin;
		
		// enable rtoken on $ilCtrl
		$ilCtrl->getFormAction($this);
		
		
		$form = new ilPropertyFormGUI();
		$form->setFormAction($ilCtrl->getFormAction($this));
		$form->setTitle($lng->txt('config_title'));

		$cb_prop = new ilCheckboxInputGUI($lng->txt("config_print_control_chars"), "printctrlchars");
		$cb_prop->setValue("1");
		$cb_prop->setChecked($settings->printctrlchars);
		$form->addItem($cb_prop);


		$form->addCommandButton("scfg", $lng->txt("config_save"));
		return $form;
	}
}
?>