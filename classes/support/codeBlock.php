<?php 

class codeBlock {
    var $object = null;
    var $nr = null;    

    public function __construct($nr, $object)
	{
        $object->plugin->includeClass("./ui/codeBlockUI.php");
        $this->object = $object;
        $this->nr = $nr;        
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

    function getLinesForBlock() {
		if (is_array($this->object->additional_data['blocks'])){
			$res = $this->object->additional_data['blocks'][$this->nr]['lines']+0;
			if ($res==0) $res = 15;
			return $res;
		} else {
			return 15;
		}
	}

	function setLinesForBlock($value) {
		if (!is_array($this->object->additional_data['blocks'])){
			$this->object->additional_data['blocks'] = array();			
		} 	
		$this->object->additional_data['blocks'][$this->nr]['lines'] = $value;
	}

    function getTypeForBlock() {
		if (is_array($this->object->additional_data['blocks'])){
			return $this->object->additional_data['blocks'][$this->nr]['type'];
		} else {
			if ($this->nr==0) return assCodeQuestionBlockTypes::StaticCode;
			if ($this->nr==1) return assCodeQuestionBlockTypes::SolutionCode;
			if ($this->nr==2) return assCodeQuestionBlockTypes::StaticCode;

			return assCodeQuestionBlockTypes::HiddenCode;
		}
	}

	function setTypeForBlock($value) {
		if (!is_array($this->object->additional_data['blocks'])){
			$this->object->additional_data['blocks'] = array();			
		} 	
		$this->object->additional_data['blocks'][$this->nr]['type'] = $value;
	}

	function getContentForBlock() {
		if (is_array($this->object->additional_data['blocks'])){
			return $this->fixLoadedCode($this->object->additional_data['blocks'][$this->nr]['content']);
		} else {
			if ($this->nr==0) return $this->fixLoadedCode($this->object->additional_data['prefixCode']);
			if ($this->nr==1) return $this->fixLoadedCode($this->object->additional_data['bestSolution']);
			if ($this->nr==2) return $this->fixLoadedCode($this->object->additional_data['postfixCode']);

			return '';
		}
	}

	function setContentForBlock($value) {
		if (!is_array($this->object->additional_data['blocks'])){
			$this->object->additional_data['blocks'] = array();			
		} 	
		$this->object->additional_data['blocks'][$this->nr]['content'] = $value;
	}
}

?>