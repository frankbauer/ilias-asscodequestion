<?php 

class codeBlock {
    var $object = null;
    var $block = null;    

	/**
	 * $block - Data of this block or null if we should create a default set
	 * $object - The paret codeBlocks Object
	 */
    public function __construct($block, $object)
	{
        $object->getPlugin()->includeClass("./ui/codeBlockUI.php");
		$this->object = $object;
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
		return $object->getDataVersion();
	}
	
	function getRawData(){
		return $block;
	}

	function tidyUnusedProperties(){
		if (getType()!=assCodeQuestionBlockTypes::SolutionCode){
			unset($this->block['lines']);
		}
		if (getType()!=assCodeQuestionBlockTypes::Canvas){
			unset($this->block['width']);
			unset($this->block['height']);
			unset($this->block['version']);
			unset($this->block['align']);
		}
	}

    var $ui = null;
    function ui(){
        if ($this->ui==null){
            $this->ui = new codeBlockUI($this);
        }
        return $this->ui;
    }

    function fixLoadedCode($str){
		return str_replace('<br />', '', str_replace('&lt;', '<', is_string($str) ? $str : ''));
	}

	function fixSentCode($str){
		return str_replace('<', '&lt;', $str);
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

    function getLines() {
		if (!isset($this->block['lines'])) return 'auto';

		$res = $this->block['lines'];
		if ($res == 'auto') return 'auto';
		$res += 0;
		if ($res==0) $res = 10;
		return $res;		
	}

	function setLines($value) {
		$this->block['lines'] = $value;
	}

    function getType() {
		return $this->block['type'];		
	}

	function setType($value) {
		$this->block['type'] = $value;
	}

	function getContent() {
		return $this->fixLoadedCode($this->block['content']);
	}

	function setContent($value) {
		$this->block['content'] = $value;
	}

	function getVersion(){
		if ($this.getDataVersion()==100){
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
		if (!isset($this->block['align'])) return 'center';
		return $this->block['align'];
	}
}

?>