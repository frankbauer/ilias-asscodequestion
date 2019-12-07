<?php 

class codeBlockUI {
    //a codeBlock instance
    var $model = null;

    public function __construct($model)
	{
        $this->model = $model;        
    }

    public function render(){
        $type = $this->model->getType();
            
        if ($type==assCodeQuestionBlockTypes::StaticCode) 
            return $this->renderStaticBlock();

        if ($type==assCodeQuestionBlockTypes::HiddenCode) 
            return $this->renderHiddenBlock();

        if ($type==assCodeQuestionBlockTypes::SolutionCode) 
            return $this->renderBlock();

        if ($type==assCodeQuestionBlockTypes::Canvas) 
            return $this->renderCanvas();

        if ($type==assCodeQuestionBlockTypes::Text) 
            return $this->renderText();

        return '';
    }

    private function renderCanvas(){
        $html  = '<playground ';
        $html .= 'data-version="'.$this->model->getVersion().'" '.
                 'width="'.$this->model->getWidth().'" '.
                 'height="'.$this->model->getHeight().'" '.
                 'align="'.$this->model->getAlign().'" ';
        $html .= '>'.$this->model->getContent()."</playground>";
        return $html;
    }

    private function renderBlock(){
        $html  = '<block ';
        $html .= 'data-visible-lines="'.$this->model->getLines().'" ';
        $html .= '>'.$this->model->getContent().'</block>';
        return $html;
    }

    private function renderHiddenBlock(){
        return "<block data-hidden>".$this->model->getContent()."</block>";
    }

    private function renderStaticBlock(){
        return "<block data-static>".$this->model->getContent()."</block>";
    }

    private function renderText(){
        return "<text>".$this->model->getContent()."</text>";
    }
}

?>