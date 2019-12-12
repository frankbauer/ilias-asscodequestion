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

    public function render($withSolution=false, $solutions=NULL){
        $type = $this->model->getType();
            
        if ($type==assCodeQuestionBlockTypes::StaticCode) 
            return $this->renderStaticBlock();

        if ($type==assCodeQuestionBlockTypes::HiddenCode) 
            return $this->renderHiddenBlock();

        if ($type==assCodeQuestionBlockTypes::SolutionCode) 
            return $this->renderBlock($withSolution, $solutions);

        if ($type==assCodeQuestionBlockTypes::Canvas) 
            return $this->renderCanvas();

        if ($type==assCodeQuestionBlockTypes::Text) 
            return $this->renderText();

        return '';
    }

    private function renderCanvas(){
        $html  = '<playground ';
        $html .= 'data-version="'.$this->model->getVersion().'" '.
                 ($this->model->getShouldAutoReset()) ? 'data-should-autoreset ' : ''.
                 'width="'.$this->model->getWidth().'" '.
                 'height="'.$this->model->getHeight().'" '.
                 'align="'.$this->model->getAlign().'" ';
        $html .= '>'.$this->model->getContent()."</playground>";
        return $html;
    }

    private function renderBlock($withSolution=false, $solutions=NULL){
        $html  = '<block ';
        $html .= 'data-visible-lines="'.$this->model->getLines().'" '; 
        if ($this->model->getHasAlternativeContent()) 
            $html .= 'data-alternative-content="'.$this->model->getAlternativeContent().'" ';  

        $html .= '>';
        if ($withSolution) {
            if (is_object($solutions)){
                $nr = $this->model->getNr();
                //print_r($nr);
                $html .= $solutions->$nr;
            }
        } else {
            $html .= $this->model->getContent();            
        }
        $html .= '</block>';            
        return $html;
    }

    private function renderHiddenBlock(){
        return "<block data-hidden>".$this->model->getContent()."</block>";
    }

    private function renderStaticBlock(){
        return '<block data-static data-visible-lines="auto">'.$this->model->getContent()."</block>";
    }

    private function renderText(){
        return "<text>".$this->model->getContent()."</text>";
    }
}

?>