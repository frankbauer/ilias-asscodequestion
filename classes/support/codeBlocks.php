<?php 

class codeBlocks implements ArrayAccess {
	const DEFAULT_DATA_VERSION = '101';

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
		$this->getPlugin()->includeClass("./support/codeblocks-conf-0.2.14.php");		

		if ($json_data == null){
			$this->additional_data = array();
			$this->additional_data['version'] = self::DEFAULT_DATA_VERSION;
			$this->additional_data['vcodeblocks'] = CODEBLOCKS_VERSION;
			$this->additional_data['blocks'] = array();
			$this->additional_data['domlibs'] = array();
			$this->additional_data['workerlibs'] = array();

			$this->blocks = array();
			$this->blocks[] = new codeBlock(0, array('type'=>assCodeQuestionBlockTypes::StaticCode, 'content'=>''), $this);
			$this->blocks[] = new codeBlock(1, array('type'=>assCodeQuestionBlockTypes::SolutionCode, 'lines'=>'10', 'content'=>''), $this);
			$this->blocks[] = new codeBlock(2, array('type'=>assCodeQuestionBlockTypes::StaticCode, 'content'=>''), $this);
		} else {
			$this->setJSONEncodedAdditionalData($json_data);
		}
	}
	
	/**
	 * Used to generate a token for each solution. 
	 * We will use this when talking to a solution as a salt.
	 */
	function guidv4()
	{
		if (function_exists('com_create_guid') === true)
			return trim(com_create_guid(), '{}');

		$data = openssl_random_pseudo_bytes(16);
		$data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
		$data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
		return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
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
	
	function updateWithJSONEncodedAdditionalData($data){
		$this->setJSONEncodedAdditionalData($data);
	}

    private function setJSONEncodedAdditionalData($data) {
        $this->additional_data = json_decode($data, true);   
		
		if (!isset($this->additional_data['version'])){
			$this->additional_data['version'] = 100;
		}

		if (!isset($this->additional_data['vcodeblocks'])){
			$this->additional_data['vcodeblocks'] = "0.1.1";
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

		//force reload of blocks data structure
		$this->loadBlocks(true);
		
		// print_r($this->additional_data);
		// print_r($data);
		// die;
    }
    
    /**
     * Loads the blocks structure from the internal attribute 'additional_data'
     */
	private function loadBlocks($forecReload=false){
        $ct = count($this->additional_data['blocks']);
        
		if ($forecReload || $this->blocks == null /*|| $ct!=count($this->blocks)*/){
			$this->blocks = array();
			for ($i=0; $i<$ct; $i++){
				$this->blocks[] = new codeBlock($i, $this->additional_data['blocks'][$i], $this);
			}
		}
		return $this->blocks;
	}

	function tidyAdditionalData(){
		$this->additional_data['storageUUID'] = $this->guidv4();
		$bls = array();
		foreach($this->blocks as $cbl){
			$cbl->tidyUnusedProperties();
			$bls[] = $cbl->getRawData();
		}
		$this->additional_data['blocks'] = $bls;
		return $this->additional_data;
	}

	function getJSONEncodedAdditionalData(){
		return json_encode($this->tidyAdditionalData());
	}

	public function getDataVersion(){		
		return $this->additional_data['version'];
	}

	public function getStorageUUID(){
		return $this->additional_data['storageUUID'];
	}

	public function getMinCanvasVersion(){
		$v = 999999;
		foreach($this->blocks as $cbl){
			if ($cbl->getType() == assCodeQuestionBlockTypes::Canvas){
				$bv = (int)$cbl->getVersion();
				if ($bv < $v) {
					$v = $cbl->getVersion();
				}
			}
		}
		return $v;
	}

	public function setFromPOST($P){	
        $settings = json_decode($P['block_settings'][$this->getID()]);
		$randomizer = $settings->randomizer;
		
		$blocks = $P['block'][$this->getID()];
		$blockOptions = $P['block_options'][$this->getID()];
		for ($i=0;$i<count($blockOptions); $i++){
			$blockOptions[$i] = json_decode($blockOptions[$i]);
		}	

		//rebuild Data object
		$this->additional_data = array();
		
		$this->additional_data['version'] = self::DEFAULT_DATA_VERSION;
		$this->additional_data['vcodeblocks'] = CODEBLOCKS_VERSION;
		$this->additional_data['language'] = $settings->language;
		
		if (isset($settings->compiler)){
			$this->additional_data['compiler'] = array(
				'language' => $settings->compiler->languageType,
				'version' => $settings->compiler->version
			);
		} else {
			unset($this->additional_data['compiler']);
		}

		$this->additional_data['domlibs'] = $settings->domLibs;
		$this->additional_data['workerlibs'] = $settings->workerLibs;

		$this->setTimeoutMS( $settings->executionTimeout );
		$this->setMaxChars( $settings->maxCharacters );
		$this->setAllowRun( $settings->runCode == 1 || $settings->runCode == 'true' );
		$this->setTheme( $settings->solutionTheme );
		$this->setROTheme( $settings->codeTheme );
		$this->setOutputParser( $settings->outputParser );
		$this->setContinuousCompilation( $settings->continuousCompilation);
		$this->setPersistentArguments( $settings->persistentArguments);
        $this->setMessagePassing( $settings->messagePassing);
        $this->setKeepAlive( $settings->keepAlive);

		$this->setRandomizerActive( $randomizer->active );
		$this->setRandomizerPreviewIndex( $randomizer->previewIndex );
		$this->setRandomizerTags( $randomizer->knownTags );
		$this->setRandomizerSets( $randomizer->sets );        
        
		//handle blocks
		$this->clearBlocks();
		for ($i=0;$i<count($blockOptions); $i++){
			$abl = '';
			if (isset($P['alt_block']) 
				&& isset($P['alt_block'][$this->getID()]) 
				&& isset($P['alt_block'][$this->getID()][$i])
			) {
				$abl = $P['alt_block'][$this->getID()][$i];
			}

			if (isset($P['toolbox_block']) 
				&& isset($P['toolbox_block'][$this->getID()]) 
				&& isset($P['toolbox_block'][$this->getID()][$i])
			) {				
				$blockOptions[$i]->toolbox = $P['toolbox_block'][$this->getID()][$i];				
			}

			
			$this->blocks[] = codeBlock::createFromPreparedPOST($i, $blockOptions[$i], $blocks[$i], $abl, $this);
		}	
	}

	function processStringWithSet($str, $set){				
		if ($set==NULL) return $str;
		return preg_replace_callback(
			CODEBLOCKS_TAG_REGEX,
			function ($treffer)  use ($set) {
				return $set[$treffer['name']];
			},
			$str
		);		
	}

	function getRandomSet($setNr){
		$set = $this->getRandomizerSets();
		if ($setNr>=0 && $setNr < count($set)) $set = $set[$setNr];
		else if ($this->getRandomizerPreviewIndex()>=0 && $this->getRandomizerPreviewIndex() < count($set)) $set = $set[$this->getRandomizerPreviewIndex()];
		else if ( 0 < count($set)) $set = $set[0];
		else $set = NULL;

		return $set;
	}

	function getBestRandomSolution($setNr){
		$res = array();
		$set = ($this->getRandomizerActive())?$this->getRandomSet($setNr):NULL;

		for ($i=0; $i<count($this->blocks); $i++){
			$res[$i] = $this[$i]->getContentForSet($set);			
		}
		return $res;
	}
	

	function getRandomBlocks($setNr){
		$res = array();
		$set = ($this->getRandomizerActive())?$this->getRandomSet($setNr):NULL;

		for ($i=0; $i<count($this->blocks); $i++){
			if ($this[$i]->getType() == assCodeQuestionBlockTypes::SolutionCode){
				$res[$i] = $this[$i]->getAlternativeContentForSet($set);
			} else {				
				$res[$i] = $this[$i]->getContentForSet($set);
			}
		}
		return $res;
	}

	function getCombinedBlocks($state=NULL, $withSolution=false, $solutions=NULL){
		$res = array();
		
		for ($i=0; $i<count($this->blocks); $i++){
			$res[$i] = $this[$i]->getCombinedContent($state, ($this[$i]->getType() == assCodeQuestionBlockTypes::SolutionCode) && $withSolution, $solutions);
		}
		return $res;
	}
	

	function getRandomizerActive(){
		return isset($this->additional_data['rndAct']) ? $this->additional_data['rndAct'] : false;
	}

	function setRandomizerActive($newValue){
		$this->additional_data['rndAct'] = $newValue;
	}

	function getRandomizerPreviewIndex(){
		return isset($this->additional_data['rndIdx']) ? $this->additional_data['rndIdx'] : 0;
	}

	function setRandomizerPreviewIndex($newValue){
		$this->additional_data['rndIdx'] = $newValue;
	}

	function getRandomizerTags(){
		return isset($this->additional_data['rndTags']) ? $this->additional_data['rndTags'] : array();
	}

	function setRandomizerTags($newValue){
		$this->additional_data['rndTags'] = $newValue;
	}

	function getRandomizerSets(){
		return isset($this->additional_data['rndSets']) ? $this->additional_data['rndSets'] : array();
	}    

	function setRandomizerSets($newValue){
		$this->additional_data['rndSets'] = $newValue;
	}

	function getContinuousCompilation(){
		return isset($this->additional_data['continuousCompilation']) ? $this->additional_data['continuousCompilation'] :false; 
	}
	function setContinuousCompilation($newValue){
		return $this->additional_data['continuousCompilation'] = $newValue; 
	}

	function getPersistentArguments(){
		return isset($this->additional_data['persistentArguments']) ? $this->additional_data['persistentArguments'] :false; 
	}
	function setPersistentArguments($newValue){
		return $this->additional_data['persistentArguments'] = $newValue; 
	}
    function getMessagePassing(){
		return isset($this->additional_data['messagePassing']) ? $this->additional_data['messagePassing'] :false; 
	}
	function setMessagePassing($newValue){
		return $this->additional_data['messagePassing'] = $newValue; 
	}
    function getKeepAlive(){
		return isset($this->additional_data['keepAlive']) ? $this->additional_data['keepAlive'] :false; 
	}
	function setKeepAlive($newValue){
		return $this->additional_data['keepAlive'] = $newValue; 
	}


	function getDomLibs() {
		return $this->additional_data['domlibs'];
	}

	function getWorkerLibs() {
		return $this->additional_data['workerlibs'];
	}

	function getCompilerLanguage() {
		//old style
		if (
			$this->getDataVersion()=='100' 
			||
			!is_string($this->additional_data['compiler']['language'])
		) {
			return $this->getLanguage();
		}
		
		return $this->additional_data['compiler']['language'];		
	}
    
    function getCompilerVersion() {
		//old style
		if ( $this->getDataVersion()=='100' ) {
			$v = $this->_getLanguage();
			if ($v == 'java2') return '100';
			if ($v == 'java') return '001';
			return '100';
		}
		
		return is_string($this->additional_data['compiler']['version']) ? $this->additional_data['compiler']['version'] : 'default';
	}

	private function _getLanguage() {
		return is_string($this->additional_data['language']) ? $this->additional_data['language'] : 'javascript';
	}
    
    function getLanguage() {
		$v = $this->_getLanguage();
		if ($v == 'java2') $v = 'java';
		return $v;
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
		return isset($this->additional_data['timeoutMS']) ? $this->additional_data['timeoutMS'] : 5000; 
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

	function getOutputParser() {
		return isset($this->additional_data['outputParser']) ? $this->additional_data['outputParser'] : 'auto'; 
	}

	function setOutputParser($newValue) {
		$this->additional_data['outputParser'] = $newValue;
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



	function getCompleteCombinedCode($state=NULL, $withSolution=false, $solutions=NULL){
		$blocks = $this->getCombinedBlocks($state, $withSolution, $solutions);
	}
}

?>