<?php 

class codeBlockUI {
    //a codeBlock instance
    var $model = null;

    public function __construct($model)
	{
        $this->model = $model;        
    }

    private function saveParamString($str){        
        $str = str_replace("\"", "&quot;",$str);
        return $str;
    }

    public function print($withSolution=false, $solutions=NULL, $state=NULL){
        if ($type==assCodeQuestionBlockTypes::StaticCode || $type==assCodeQuestionBlockTypes::Text) {
            return '<pre>' . $this->model->printableString($this->getContent($state)) . '</pre>';
        } else if ($type==assCodeQuestionBlockTypes::SolutionCode) {
            return $this->renderBlock($withSolution, $solutions, $state, true);
        }else if ($type==assCodeQuestionBlockTypes::Blockly) {
            return $this->renderBlockly($withSolution, $solutions, $state, true);
        }
    }

    public function getContent($state=NULL, $withSolution=false, $solutions=NULL){
        return $this->model->getCombinedContent($state, $withSolution, $solutions);
    }

    public function render($withSolution=false, $solutions=NULL, $state=NULL){
        $type = $this->model->getType();
            
        if ($type==assCodeQuestionBlockTypes::StaticCode) 
            return $this->renderStaticBlock($state);

        if ($type==assCodeQuestionBlockTypes::HiddenCode) 
            return $this->renderHiddenBlock($state);

        if ($type==assCodeQuestionBlockTypes::SolutionCode) 
            return $this->renderBlock($withSolution, $solutions, $state, false);

        if ($type==assCodeQuestionBlockTypes::Canvas) 
            return $this->renderCanvas($state);

        if ($type==assCodeQuestionBlockTypes::Text) 
            return $this->renderText($state);

        if ($type==assCodeQuestionBlockTypes::Blockly) 
            return $this->renderBlockly($withSolution, $solutions, $state, false);

        return '';
    }

    private function renderCanvas($state){        
        $html  = '<playground ';
        $html .= 'data-version="'.$this->model->getVersion().'" '.
                 (($this->model->getShouldAutoReset()) ? 'data-should-autoreset ' : '').
                 ((!$this->model->getExpanded()) ? 'data-expanded=0 ' : '').
                 ((!$this->model->getCodeExpanded()) ? 'data-code-expanded=0 ' : '').
                 'width="'.$this->model->getWidth().'" '.
                 'height="'.$this->model->getHeight().'" '.
                 'align="'.$this->model->getAlign().'" ';
        $html .= '>'.$this->getContent($state)."</playground>";
        return $html;
    }

    private function renderBlock($withSolution=false, $solutions=NULL, $state=NULL, $print=false){
        $html  = '<';
        if (!$print){
            $html .= 'block ';
            $html .= 'data-visible-lines="'.$this->model->getLines().'" '; 
            if (!$this->model->getExpanded()) $html .= 'data-expanded=0 ';
            if ($this->model->getHasAlternativeContent()) 
                $html .= 'data-alternative-content="'.$this->saveParamString($this->model->getAlternativeContent()).'" '; 
            
            $html .= '>';
            $html .= $this->getContent($state, $withSolution, $solutions);                    
            $html .= '</block>';
        } else {
            $html .= 'pre>';
            $html .= $this->model->printableString($this->getContent($state, $withSolution, $solutions));
            $html .= '</pre>';
        }

        
        return $html;
    }

    private function renderHiddenBlock($state=NULL){

        return "<block data-hidden".(!$this->model->getExpanded() ? ' data-expanded=0' : '').">".$this->getContent($state)."</block>";
    }

    private function renderStaticBlock($state=NULL){
        return '<block data-static data-visible-lines="auto"'.(!$this->model->getExpanded() ? ' data-expanded=0' : '').'>'.$this->getContent($state)."</block>";
    }

    private function renderText($state=NULL){
        return "<text".(!$this->model->getExpanded() ? ' data-expanded=0' : '').">".$this->getContent($state)."</text>";
    }

    private function renderBlockly($withSolution=false, $solutions=NULL, $state=NULL, $print=false){
        
        $bl = $this->model->getBlockly();
        $str = "<blockly ".
                ((!$this->model->getExpanded()) ? 'data-expanded=0 ' : '').
                (($this->model->getBlocklyShowControls()) ? 'data-show-controls=1 ' : '').
                 'width="'.$this->model->getWidth().'" '.
                 'height="'.$this->model->getHeight().'" '.
                 'align="'.$this->model->getAlign().'">';
        $str .= "<Script id=\"content\" type=\"text/xmldata\">".CodeBlock::fixExportedCode($this->getContent($state, $withSolution, $solutions))."</Script>";
        
        
        $str .= "<Toolbox>".json_encode($this->model->getToolbox())."</Toolbox>";
        $str .= "<Script id=\"customblocks\">".json_encode($this->model->getCustomBlocks())."</Script>";
        $str .= "<Script id=\"toolboxoverride\"" . ($bl['useOverride']?' use':'')." type=\"text/xmldata\">".$this->model->getToolboxOverride()."</Script>";
        $str .= "</blockly>";

        return $str;
    }
}

?>