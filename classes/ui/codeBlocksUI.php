<?php 

class codeBlocksUI {
    //a codeBlock instance
    var $model = null;

    public function __construct($model)
	{
        $this->model = $model;        
    }

    public function print(){
        $html  = '<div>';
        for ($i=0; $i<$this->model->getNumberOfBlocks(); $i++){
            $html .= $this->model[$i]->ui()->print();
        }
        $html .= '</div>';
    }

    
    public function render($editMode=false, $readOnly=false, $withSolution=false, $solutions=NULL){
        $html  = '';
        $html .= '<div '.($editMode?'codeblockseditor ':'codeblocks ');
        $html .= 'data-id="'.$this->model->getId().'" '.
                 'data-compiler="'.$this->model->getCompilerLanguage().'" '.
                 'data-compiler-version="'.$this->model->getCompilerVersion().'" '.
                 'data-language="'.$this->model->getLanguage().'" '.
                 'data-execution-timeout="'.$this->model->getTimeoutMS().'" '.
                 'ddata-max-characters="'.$this->model->getMaxChars().'" '.
                 'data-run-code="'.($this->model->getAllowRun()?'true':'false').'" '.
                 'data-solution-theme="'.$this->model->getTheme().'" '.
                 'data-code-theme="'.$this->model->getROTheme().'" '.
                 "data-dom-libs='".json_encode($this->model->getDomLibs())."' ".
                 "data-worker-libs='".json_encode($this->model->getWorkerLibs())."' ".
                 ($readOnly?'data-readonly':'').
                 'data-output-parser="'.$this->model->getOutputParser().'" '.
                 '>';

        $html .= '<loading><div></div><div></div></loading>';

        for ($i=0; $i<$this->model->getNumberOfBlocks(); $i++){
            $html .= $this->model[$i]->ui()->render($withSolution, $solutions);
        }
            
        $html .= '</div>';

        return $html;
    }

    public function prepareTemplate($tpl, $basePath){
        if (!$tpl->didPrepareBlocks) {
            $tpl->didPrepareBlocks = true;
			$tpl->addInlineCss("codeblockseditor > *,  codeblocks > *, [codeblockseditor] > *,  [codeblocks] > *{ display:none;}");
			$tpl->addCss($basePath.'/frontend/dist/css/loader.css');
			$tpl->addCss($basePath.'/frontend/dist/css/roboto.css');
			$tpl->addCss($basePath.'/frontend/dist/css/main.css');
			$tpl->addCss($basePath.'/frontend/dist/css/app.css');
            $tpl->addCss($basePath.'/frontend/dist/css/chunk-vendors.css');
            $tpl->addCss($basePath.'/css/custom.css');
            $tpl->addJavaScript($basePath.'/js/legacyHelper.js');

            $tpl->addOnLoadCode("$('head').append('<meta name=\"codeblocks-baseurl\" content=\"" . $basePath . "/frontend/dist/\">');");

			$tpl->addOnLoadCode("import('" . $basePath . "/frontend/dist/js/chunk-vendors.js')");
			$tpl->addOnLoadCode("import('" . $basePath . "/frontend/dist/js/app.js')");
		}	
    }
}

?>