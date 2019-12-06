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
				'content' => '',
				'LINES' => 'auto'
			);
		} else {
			$this->block = $block;        
		}
	}
	
	function getRawData(){
		return $block;
	}

    var $ui = null;
    function getUI(){
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
		$res = $this->block['lines'];
		if ($res==0) $res = 15;
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
}

?>