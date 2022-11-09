<?php 

class codeBlock {
    var $object = null;
	var $block = null; 
	var $nr = null;   

	/**
	 * $block - Data of this block or null if we should create a default set
	 * $object - The paret codeBlocks Object
	 */
    public function __construct($nr, $block, $object)
	{
        $object->getPlugin()->includeClass("./ui/codeBlockUI.php");
		$this->object = $object;
		$this->nr = $nr;
		if ($block==null){
			$this->block = array(				
				'type' => assCodeQuestionBlockTypes::StaticCode,
				'content' => ''
			);
		} else {
			$this->block = $block;        
		}                
	}

	public function getDataVersion(){
		return $this->object->getDataVersion();
	}
	
	function getRawData(){
		return $this->block;
	}
	
	function getNr(){
		return $this->nr;
	}

	function getHasAlternativeContent(){
		return isset($this->block['hasAltContent'])?$this->block['hasAltContent']:false;
	}

	function setHasAlternativeContent($newValue){
		$this->block['hasAltContent'] = (bool)$newValue;
	}

	function getAlternativeContent(){
		return isset($this->block['altContent'])?$this->fixLoadedCode($this->block['altContent']):'';
	}

	function getAlternativeContentForSet($set){
		if ($set==NULL) return $this->getAlternativeContent();
		return preg_replace_callback(
			CODEBLOCKS_TAG_REGEX,
			function ($treffer)  use ($set) {
				return $set[$treffer['name']];
			},
			$this->getAlternativeContent()
		);
	}

	function setAlternativeContent($newValue){
		$this->block['altContent'] = $newValue;
	}

	function tidyUnusedProperties(){
		if ($this->getType()!=assCodeQuestionBlockTypes::SolutionCode){
			unset($this->block['lines']);
			unset($this->block['altContent']);
			unset($this->block['hasAltContent']);
		}
		if ($this->getType()!=assCodeQuestionBlockTypes::Canvas && $this->getType()!=assCodeQuestionBlockTypes::Blockly){
			unset($this->block['width']);
			unset($this->block['height']);
			unset($this->block['align']);			
			unset($this->block['version']);
		}
		if ($this->getType()!=assCodeQuestionBlockTypes::Canvas && $this->getType()!=assCodeQuestionBlockTypes::Data){
			unset($this->block['codeExpanded']);
		}
	}

	public static function createFromPreparedPOST($nr, $options, $content, $altContent, $object){	
        $t = assCodeQuestionBlockTypes::StaticCode;
		if ($options->type == 'BLOCK'){
			if ($options->static==1 || $options->static=='true') 
				$t = assCodeQuestionBlockTypes::StaticCode;
			else if ($options->hidden==1 || $options->hidden=='true') 
				$t = assCodeQuestionBlockTypes::HiddenCode;
			else 
				$t = assCodeQuestionBlockTypes::SolutionCode;
		} else if ($options->type == 'PLAYGROUND'){
			$t = assCodeQuestionBlockTypes::Canvas;
		} else if ($options->type == 'TEXT'){
			$t = assCodeQuestionBlockTypes::Text;
		} else if ($options->type == 'BLOCKLY'){
			$t = assCodeQuestionBlockTypes::Blockly;
			if (is_object($options->blockly)) {
				//convert from std class (object) to array				
				$ar = [];
				foreach ($options->blockly as $i=>$val){
					$ar[$i] = $val;					
				}
				$options->blockly = $ar;
			}
		} else if ($options->type == 'REPL'){
			$t = assCodeQuestionBlockTypes::REPL;
		} else if ($options->type == 'DATA'){
			$t = assCodeQuestionBlockTypes::Data;
		} 
        
		$data = array(
			'expanded' => $options->expanded == 1 || $options->expanded == 'true',
			'codeExpanded' => $options->codeExpanded + 0,
			'type' => $t,
			'content' => codeBlock::fixSentCode($content),
			'lines' => $options->visibleLines,
			'width' => $options->width,
			'height' => $options->height,
            'name' => $options->name,
			'align' => $options->align,
			'version' => $options->version,
			'autoreset' => $options->shouldAutoreset == 1 || $options->shouldAutoreset == 'true',
            'generateTemplate' => $options->generateTemplate == 1 || $options->generateTemplate == 'true',
			'hasAltContent' => $options->hasAlternativeContent == 1 || $options->hasAlternativeContent == 'true',
			'altContent' => $altContent,
			'blockly' => $options->blockly
		);				
		
		$o = new codeBlock($nr, $data, $object);
		$o->tidyUnusedProperties();
		
		return $o;
	}

    var $ui = null;
    function ui(){
        if ($this->ui==null){
            $this->ui = new codeBlockUI($this);
        }
        return $this->ui;
	}
	
	public function printableString($value, $withCtrlChars=true){
		// $value = str_replace("\t", "  ",$value);
		// $value = str_replace(" ", "&nbsp;",$value);
		// $value = str_replace("\n", "<br />", $value);
		$value = str_replace("\r", "", $value);
		if ($withCtrlChars) {
			$value = str_replace("\n", "↵\n", $value);
			$value = str_replace("\t", "↦\t", $value);
		}

		return $value;
	}

    static public function fixCodeForExport($str){
		return str_replace('>', '&gt;', str_replace('<', '&lt;', str_replace('{', '&#123;', str_replace('&', '&#38;', $str))));
	}

	static public function fixExportedCode($str){
		return str_replace('&gt;', '>', str_replace('&lt;', '<', str_replace('&#123;', '{', str_replace('&amp;', '&', str_replace('&#38;', '&', $str)))));
	}

    function fixLoadedCode($str){		
		//return str_replace('<', '&lt;',$str);
		return str_replace('<', '&lt;', str_replace('{', '&#123;', $str));
		//return str_replace('<br />', '', str_replace('&lt;', '<', is_string($str) ? $str : ''));
	}

	static function fixSentCode($str){
		//return str_replace('<', '&lt;', $str);
		return str_replace('&#123;', '{', str_replace('&', '&#38;', $str));
	}

	public function __get($property) {
		return $this->block[$porperty];
	  }
	
	public function __set($property, $value) {
		if (property_exists($this, $property)) {
			return $this->block[$porperty] = $value;
		}

		return $this;
	}

    function getName(){
       return $this->block['name'];
    }

    function setName($value){
        $this->block['name'] = $value;
    }

    function getLines() {
		if (!isset($this->block['lines'])) return 'auto';

		$res = $this->block['lines'];
		if ($res == 'auto') return 'auto';
		try{
		$res += 0;
		} catch(Error $e){
			$res = 0;
		}
		if ($res==0) $res = 10;
		return $res;		
	}

	function setLines($value) {
		$this->block['lines'] = $value;
	}

	function getBlockly(){
		if (!isset($this->block['blockly'])) {
			return ["toolbox" => [], "categories" => [], "blocks" => []];
		}
		return $this->block['blockly'];
	}

	function getToolbox(){
		$bl = $this->getBlockly();
		return $bl['toolbox'];
	}

	function getToolboxOverride(){
		$bl = $this->getBlockly();
		return $bl['toolboxOverride'];		
	}

	function getCustomBlocks(){
		$bl = $this->getBlockly();
		return $bl['blocks'];		
	}

	function getBlocklyShowControls() {
		$bl = $this->getBlockly();
		if (!isset($bl['showControls'])) return false;
		return $bl['showControls'];		
	}

	function getExpanded() {
		if (!isset($this->block['expanded'])) return true;
		return $this->block['expanded'];		
	}

	function setExpanded($value) {
		$this->block['expanded'] = $value;
	}

	function getCodeExpanded() {
		if (!isset($this->block['codeExpanded'])) return 1;
		return $this->block['codeExpanded'];		
	}

	function setCodeExpanded($value) {
		$this->block['codeExpanded'] = $value;
	}

	function getShouldAutoReset() {
		if (!isset($this->block['autoreset'])) return false;
		return $this->block['autoreset'];		
	}

	function setShouldAutoReset($value) {
		$this->block['autoreset'] = $value;
	}

	function getGenerateTemplate() {
		if (!isset($this->block['generateTemplate'])) return true;
		return $this->block['generateTemplate'];		
	}

	function setGenerateTemplate($value) {
		$this->block['generateTemplate'] = $value;
	}

    function getType() {
		return $this->block['type'];		
	}

	function setType($value) {
		$this->block['type'] = $value;
	}


    public function getCombinedContent($state=NULL, $withSolution=false, $solutions=NULL){
		$nr = $this->getNr();
		$altContent = NULL;
		if ($state!=NULL ){
			if ($state->blocks!=NULL) {				
				$altContent = $this->fixLoadedCode($state->blocks[$nr]);
			} else if ($withSolution && !$this->getHasAlternativeContent()){
				// Hm, where was this important. This will print the best Solution in the 
				// Solution view if the student did not answer the question.
				// Replaced with an empty string to prevent that!!!
				//$altContent = $this->getContent(); 
				$altContent = '';
			} else if ( $state->blocks==NULL 						
						&& $this->object->getRandomizerActive()
					){
				//this case makes sure, that we never display 
				//placeholders in student solutions, even if the question was 
				//never opened and thus we did not generate a random set.
				$set = $this->object->getRandomSet(-1);

				if ($this->getHasAlternativeContent())
					$altContent = $this->getAlternativeContentForSet($set);
				else 
					$altContent = $this->getContentForSet($set);
			}
		}

        if ($withSolution) {     			       			
            if (is_object($solutions)){                
                return $this->fixLoadedCode($solutions->$nr);
            } else if (is_array($solutions)){
                return $this->fixLoadedCode($solutions[$nr]);
            }

            if ($altContent != NULL) {
                return $altContent;
            } if ($this->getHasAlternativeContent()){
                return $this->getAlternativeContent();
            }
            return '';
        }

        if ($altContent == NULL) {
            return $this->getContent();
        }

        return $altContent;
    }

	function getContent() {
		return $this->fixLoadedCode($this->block['content']);
	}

	function getContentForSet($set){	
		if ($set==NULL) return $this->getContent();
		return preg_replace_callback(
			CODEBLOCKS_TAG_REGEX,
			function ($treffer)  use ($set) {				
				return $set[$treffer['name']];
			},
			$this->getContent()
		);
	}

	function setContent($value) {
		$this->block['content'] = $value;
	}

	function getVersion(){
		if ($this->getDataVersion()==100){
			return '100';
		}

		if (!isset($this->block['version'])) return '101';
		return $this->block['version'];
	}

	function getWidth(){
		if (!isset($this->block['width'])) return '100%';
		return $this->block['width'];
	}

	function getHeight(){
		if (!isset($this->block['height'])) return '200px';
		return $this->block['height'];
	}

	function getAlign(){
		if (!isset($this->block['align'])) return 'left';
		return $this->block['align'];
	}
}

?>