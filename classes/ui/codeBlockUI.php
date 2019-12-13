<?php 

class codeBlockUI {
    //a codeBlock instance
    var $model = null;

    public function __construct($model)
	{
        $this->model = $model;        
    }

    public function print(){
        if ($type==assCodeQuestionBlockTypes::StaticCode || $type==assCodeQuestionBlockTypes::Text) {
            return '<pre>' . $this->model->getPrintableContent() . '</pre>';
        } else if ($type==assCodeQuestionBlockTypes::SolutionCode) {
        }
    }

    public function render($withSolution=false, $solutions=NULL, $set=NULL){
        $type = $this->model->getType();
            
        if ($type==assCodeQuestionBlockTypes::StaticCode) 
            return $this->renderStaticBlock($set);

        if ($type==assCodeQuestionBlockTypes::HiddenCode) 
            return $this->renderHiddenBlock($set);

        if ($type==assCodeQuestionBlockTypes::SolutionCode) 
            return $this->renderBlock($withSolution, $solutions, $set);

        if ($type==assCodeQuestionBlockTypes::Canvas) 
            return $this->renderCanvas($set);

        if ($type==assCodeQuestionBlockTypes::Text) 
            return $this->renderText($set);

        return '';
    }

    private function renderCanvas($set=NULL){        
        $html  = '<playground ';
        $html .= 'data-version="'.$this->model->getVersion().'" '.
                 (($this->model->getShouldAutoReset()) ? 'data-should-autoreset ' : '').
                 ((!$this->model->getExpanded()) ? 'data-expanded=0 ' : '').
                 ((!$this->model->getCodeExpanded()) ? 'data-code-expanded=0 ' : '').
                 'width="'.$this->model->getWidth().'" '.
                 'height="'.$this->model->getHeight().'" '.
                 'align="'.$this->model->getAlign().'" ';
        $html .= '>'.$this->model->getContentForSet($set)."</playground>";
        return $html;
    }

    private function renderBlock($withSolution=false, $solutions=NULL, $set=NULL){
        $html  = '<block ';
        $html .= 'data-visible-lines="'.$this->model->getLines().'" '; 
        if (!$this->model->getExpanded()) $html .= 'data-expanded=0 ';
        if ($this->model->getHasAlternativeContent()) 
            $html .= 'data-alternative-content="'.$this->model->getAlternativeContentForSet($set).'" ';  

        $html .= '>';
        if ($withSolution) {
            $nr = $this->model->getNr();
            if (is_object($solutions)){                
                $html .= $solutions->$nr;
            } else if (is_array($solutions)){
                $html .= $solutions[$nr];
            }
        } else {
            $html .= $this->model->getContentForSet($set);            
        }
        $html .= '</block>';            
        return $html;
    }

    private function renderHiddenBlock($set=NULL){

        return "<block data-hidden".(!$this->model->getExpanded() ? ' data-expanded=0' : '').">".$this->model->getContentForSet($set)."</block>";
    }

    private function renderStaticBlock($set=NULL){
        return '<block data-static data-visible-lines="auto"'.(!$this->model->getExpanded() ? ' data-expanded=0' : '').'>'.$this->model->getContentForSet($set)."</block>";
    }

    private function renderText($set=NULL){
        return "<text".(!$this->model->getExpanded() ? ' data-expanded=0' : '').">".$this->model->getContentForSet($set)."</text>";
    }
}

?>