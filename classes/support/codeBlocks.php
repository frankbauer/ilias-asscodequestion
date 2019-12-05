<?php 

class codeBlocks {
    /* custom data we need to store fpr this question type. This array is serialized to json and stored in the db */
    var $additional_data = array();

    /* store the block-access objects. Data is allways stored in $additional_data, but the block-objects provide the Model for the data */
    var $blocks = null;
    
    var $plugin = null;
    
    public function __construct($plugin, $json_data, $id) {
        $this->plugin = $plugin;
        $this->getPlugin()->includeClass("./support/codeBlock.php");

        $this->setJSONEncodedAdditionalData($json_data);
    }

    private function getPlugion(){
        return $this->plugin;
    }

    private function setJSONEncodedAdditionalData($data) {
        $this->additional_data = json_decode($data, true);   
        
        // initialize new block structure for
        // old version with fixed code blocks
        if (!is_array($this->additional_data['blocks'])){
            $this->additional_data['blocks'] = array();
            for ($nr=0; $nr<3; $nr++){
                $this->additional_data['blocks'][$nr]['lines'] = 15;

                $t = assCodeQuestionBlockTypes::HiddenCode;;
                if ($nr==0) $t = assCodeQuestionBlockTypes::StaticCode;
			    else if ($nr==1) $t = assCodeQuestionBlockTypes::SolutionCode;
			    else if ($nr==2) $t = assCodeQuestionBlockTypes::StaticCode;
                $this->additional_data['blocks'][$nr]['type'] = $t;

                $t = '';
                if ($nr==0) $t = $this->additional_data['prefixCode'];
			    else if ($nr==1) $t = $this->additional_data['bestSolution'];
                else if ($nr==2) $t = $this->additional_data['postfixCode'];
                $this->additional_data['blocks'][$nr]['content'] = $t;
            }

            unset($this->additional_data['prefixCode']);
            unset($this->additional_data['bestSolution']);
            unset($this->additional_data['postfixCode']);
        }

        $this->loadBlocks(true);
    }
    
    /**
     * Loads the blocks structure from the 
     */
	private function loadBlocks($forecReload=false){
        $ct = count($this->additional_data['blocks']);
		if ($forecReload || $this->blocks == null || $ct!=count($this->blocks)){
			$this->blocks = array();
			for ($i=0; $i<$ct; $i++){
				$this->blocks[] = new codeBlock($this->additional_data['blocks'][$i], $this);
			}
		}
		return $this->blocks;
	}

	function getJSONEncodedAdditionalData(){
		return json_encode($this->additional_data);
    }
    
    function getLanguage() {
		return is_string($this->additional_data['language']) ? $this->additional_data['language'] : 'python';
	}

	function setLanguage($newLanguage) {
		$this->additional_data['language'] = $newLanguage;
	}

	function getAllowRun() {
		return isset($this->additional_data['allowRun']) ? $this->additional_data['allowRun'] : true;
	}

	function setAllowRun($newValue) {
		$this->additional_data['allowRun'] = (bool)$newValue;
	}

	function getTimeoutMS() {
		return isset($this->additional_data['timeoutMS']) ? $this->additional_data['timeoutMS'] : 500; 
	}

	function setTimeoutMS($newValue) {
		$this->additional_data['timeoutMS'] = (int)$newValue;
	}

	function getMaxChars() {
		return isset($this->additional_data['maxChars']) ? $this->additional_data['maxChars'] : 6000; 
	}
	
	function setMaxChars($newValue) {
		$this->additional_data['maxChars'] = (int)$newValue;
	}

	function getTheme() {
		return isset($this->additional_data['theme']) ? $this->additional_data['theme'] : 'solarized light'; 
	}
	
	function setTheme($newValue) {
		$this->additional_data['theme'] = ''.$newValue;
	}

	function getROTheme() {
		return isset($this->additional_data['themeRO']) ? $this->additional_data['themeRO'] : 'xq-light'; 
	}
	
	function setROTheme($newValue) {
		$this->additional_data['themeRO'] = ''.$newValue;
	}

	function getIncludeThreeJS() {
		return isset($this->additional_data['includeThreeJS']) ? $this->additional_data['includeThreeJS'] : false; 
	}
	
	function setIncludeThreeJS($newValue) {
		$this->additional_data['includeThreeJS'] = (bool)$newValue;
	}

	function getIncludeD3() {
		return isset($this->additional_data['includeD3']) ? $this->additional_data['includeD3'] : false; 
	}
	
	function setIncludeD3($newValue) {
		$this->additional_data['includeD3'] = (bool)$newValue;
    }
    

    

	function getNumberOfBlocks() {
		return count($this->additional_data['blocks']);		
	}

	function clearBlocks(){
		$this->additional_data['blocks'] = array();
		$this->blocks = null;
	}

	function getLinesForBlock($nr) {
		$res = $this->additional_data['blocks'][$nr]['lines']+0;
		if ($res==0) $res = 15;
		return $res;		
	}

	function setLinesForBlock($nr, $value) {
		$this->additional_data['blocks'][$nr]['lines'] = $value;
	}

	function getTypeForBlock($nr) {
		return $this->additional_data['blocks'][$nr]['type'];		
	}

	function setTypeForBlock($nr, $value) {
		$this->additional_data['blocks'][$nr]['type'] = $value;
	}

	function getContentForBlock($nr) {
		return $this->fixLoadedCode($this->additional_data['blocks'][$nr]['content']);		
	}

	function setContentForBlock($nr, $value) {
		$this->additional_data['blocks'][$nr]['content'] = $value;
	}
}

?>