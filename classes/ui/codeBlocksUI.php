<?php 

class codeBlocksUI {
    //a codeBlock instance
    var $model = null;

    public function __construct($model)
	{
        $this->model = $model;        
    }

    
    public function render($editMode=false){
        $html  = '';
        $html .= $editMode?'<codeblockseditor ':'<codeblocks ';
        $html .= 'data-id="'.$this->model->getId().'" '.
                 'data-compiler="'.$this->model->getCompilerLanguage().'" '.
                 'data-compiler-version="'.$this->model->getCompilerVersion().'" '.
                 'data-language="'.$this->model->getLanguage().'" '.
                 'data-execution-timeout="'.$this->model->getTimeoutMS().'" '.
                 'ddata-max-characters="'.$this->model->getMaxChars().'" '.
                 'data-run-code="'.($this->model->getAllowRun()?'true':'false').'" '.
                 'data-solution-theme="'.$this->model->getTheme().'" '.
                 'data-code-theme="'.$this->model->getROTheme().'" '.
                 'data-dom-libs="'.json_encode($this->model->getDomLibs()).'" '.
                 'data-worker-libs="'.json_encode($this->model->getWorkerLibs()).'" '.
                 '>';

        $html .= '<loading><div></div><div></div></loading>';

        for ($i=0; $i<$this->model->getNumberOfBlocks(); $i++){
            $html .= $this->model[$i]->ui()->render();
        }
    
        $html .=  $editMode?'</codeblockseditor>':'</codeblocks>';

        return $html;
    }

    public function prepareTemplate($tpl, $basePath){
        if (!$tpl->didPrepareBlocks) {
            $tpl->didPrepareBlocks = true;
			$tpl->addInlineCss("codeblockseditor > *,  codeblocks > *{
				display:none;        
			  }
			  
			  codeblockseditor, codeblocks, .code{
				display: block;
				position:relative;
				text-align: center;
				margin:auto;
				width:90%;
				height:150px;
				border:1px solid rgba(0,0,0,0.2);
				margin-bottom:50px;
				font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif
			  }			  
			  codeblockseditor::before, codeblocks::before {
				content:\"loading...\"
			  }			  			  
			  loading {
				display: inline-block;
				position: relative;
				top: 35px;
				width: 80px;
				height: 80px;
			  }
			  loading div {
				position: absolute;
				border: 4px solid rgb(43, 44, 50);
				opacity: 1;
				border-radius: 50%;
				animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
			  }
			  loading div:nth-child(2) {
				animation-delay: -0.5s;
			  }
			  @keyframes lds-ripple {
				0% {
				  top: 36px;
				  left: 36px;
				  width: 0;
				  height: 0;
				  opacity: 1;
				}
				100% {
				  top: 0px;
				  left: 0px;
				  width: 72px;
				  height: 72px;
				  opacity: 0;
				}
			  }");
			//$tpl->addCss($basePath.'/frontend/dist/css/materialdesignicons.css');
			$tpl->addCss($basePath.'/frontend/dist/css/roboto.css');
			$tpl->addCss($basePath.'/frontend/dist/css/main.css');
			$tpl->addCss($basePath.'/frontend/dist/css/app.css');
			$tpl->addCss($basePath.'/frontend/dist/css/chunk-vendors.css');

            $tpl->addOnLoadCode("$('head').append('<meta name=\"codeblocks-baseurl\" content=\"" . $basePath . "/frontend/dist/\">');");

			$tpl->addOnLoadCode("import('" . $basePath . "/frontend/dist/js/chunk-vendors.js')");
			$tpl->addOnLoadCode("import('" . $basePath . "/frontend/dist/js/app.js')");
		}	
    }
}

?>