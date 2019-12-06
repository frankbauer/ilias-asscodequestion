<?php 

class codeBlocks implements ArrayAccess {
    /* custom data we need to store fpr this question type. This array is serialized to json and stored in the db */
    var $additional_data = array();

    /* store the block-access objects. Data is allways stored in $additional_data, but the block-objects provide the Model for the data */
    var $blocks = null;
    
	var $plugin = null;
	var $id = 0;
    
    public function __construct($plugin, $json_data, $id) {
		$this->plugin = $plugin;
		$this->id = $id;
		$this->getPlugin()->includeClass("./ui/codeBlocksUI.php");
        $this->getPlugin()->includeClass("./support/codeBlock.php");

		if ($json_data == null){
			$this->additional_data = array();
			$this->additional_data['version'] = '101';
			$this->additional_data['blocks'] = array();
			$this->additional_data['domlibs'] = array();
			$this->additional_data['workerlibs'] = array();

			$this->blocks = array();
			$this->blocks[] = new codeBlock(array('type'=>assCodeQuestionBlockTypes::StaticCode, 'content'=>''), $this);
			$this->blocks[] = new codeBlock(array('type'=>assCodeQuestionBlockTypes::SolutionCode, 'lines'=>'10', 'content'=>''), $this);
			$this->blocks[] = new codeBlock(array('type'=>assCodeQuestionBlockTypes::StaticCode, 'content'=>''), $this);
		} else {
			$this->setJSONEncodedAdditionalData($json_data);
		}
    }

    public function getPlugin(){
        return $this->plugin;
	}

	public function getId(){
		return $this->id;
	}
	
	var $ui = null;
    function ui(){
        if ($this->ui==null){
            $this->ui = new codeBlocksUI($this);
        }
        return $this->ui;
    }

    private function setJSONEncodedAdditionalData($data) {
        $this->additional_data = json_decode($data, true);   
		
		if (!isset($this->additional_data['version'])){
			$this->additional_data['version'] = 100;
		}
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
		
		if (!is_array($this->additional_data['domlibs'])){
			$this->additional_data['domlibs'] = array();
			if (isset($this->additional_data['includeThreeJS']) && $this->additional_data['includeThreeJS']){
				$this->additional_data['domlibs'][] = "3js-r0";
			} 
			if (isset($this->additional_data['includeD3']) && $this->additional_data['includeD3']){
				$this->additional_data['domlibs'][] = "d3-5.13.4";
			} 
		}

		if (!is_array($this->additional_data['workerlibs'])){
			$this->additional_data['workerlibs'] = array();
		}

		//force reload ob blocks data structure
        $this->loadBlocks(true);
    }
    
    /**
     * Loads the blocks structure from the 
     */
	private function loadBlocks($forecReload=false){
        $ct = count($this->additional_data['blocks']);
		if ($forecReload || $this->blocks == null /*|| $ct!=count($this->blocks)*/){
			$this->blocks = array();
			for ($i=0; $i<$ct; $i++){
				$this->blocks[] = new codeBlock($this->additional_data['blocks'][$i], $this);
			}
		}
		return $this->blocks;
	}

	function getJSONEncodedAdditionalData(){
		$bls = array();
		foreach($this->blocks as $cbl){
			$cbl.tidyUnusedProperties();
			$bls[] = $cbl.getRawData();
		}
		$this->additional_data['blocks'] = $bls;
		return json_encode($this->additional_data);
	}

	public function getDataVersion(){		
		return $this->additional_data['version'];
	}
	
	



	function getDomLibs() {
		return $this->additional_data['domlibs'];
	}

	function getWorkerLibs() {
		return $this->additional_data['workerlibs'];
	}

	function getCompilerLanguage() {
		return is_string($this->additional_data['compiler']['language']) ? $this->additional_data['compiler']['language'] : $this->getLanguage();
	}
    
    function getCompilerVersion() {
		return is_string($this->additional_data['compiler']['version']) ? $this->additional_data['compiler']['version'] : 'default';
	}
    
    function getLanguage() {
		return is_string($this->additional_data['language']) ? $this->additional_data['language'] : 'javascript';
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

	public function __get($property) {
		return $this->additional_data[$porperty];
	  }
	
	public function __set($property, $value) {
		if (property_exists($this, $property)) {
			return $this->additional_data[$porperty] = $value;
		}

		return $this;
	}
    





	public function offsetSet($offset, $value) {
        //we do not support the change of an offset
    }

    public function offsetExists($offset) {
        return isset($this->blocks[$offset]);
    }

    public function offsetUnset($offset) {
        unset($this->blocks[$offset]);
    }

    public function offsetGet($offset) {
        return isset($this->blocks[$offset]) ? $this->blocks[$offset] : null;
	}
	
	function getNumberOfBlocks() {
		return count($this->blocks);		
	}

	function getBlock($idx){
		return $this->blocks[idx];
	}

	function clearBlocks(){
		$this->additional_data['blocks'] = array();
		$this->blocks = array();
	}

	function addBlock(){
		$this->blocks[] = new codeBlock(null, $this);
	}
}

?>