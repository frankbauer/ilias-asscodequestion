<?php 

class codeBlocksUI {
    //a codeBlock instance
    var $model = null;
    var $uuid = null;

    public function __construct($model)
	{
        $this->uuid = $model->guidv4().'-'.$model->getId();
        $this->model = $model;        
    }

    
    
    public function getUUID(){
        return $this->uuid;
    }

    public function setUUID($newUUID){
        $this->uuid = $newUUID;
    }

    public function print($editMode=false, $readOnly=false, $withSolution=false, $solutions=NULL, $state=NULL){
        $html  = '<div>';
        for ($i=0; $i<$this->model->getNumberOfBlocks(); $i++){
            $html .= $this->model[$i]->ui()->print($withSolution, $solutions, $state);
        }
        $html .= '</div>';
        return $html;
    }

    
    public function render($editMode=false, $readOnly=false, $withSolution=false, $solutions=NULL, $state=NULL){
        $html  = '';
        $html .= '<div '.($editMode?'codeblockseditor ':'codeblocks ');
        $html .= 'data-question="'.$this->model->getId().'" '.
                 'data-compiler="'.$this->model->getCompilerLanguage().'" '.
                 'data-compiler-version="'.$this->model->getCompilerVersion().'" '.
                 'data-language="'.$this->model->getLanguage().'" '.
                 'data-execution-timeout="'.$this->model->getTimeoutMS().'" '.
                 'data-max-characters="'.$this->model->getMaxChars().'" '.
                 'data-run-code="'.($this->model->getAllowRun()?'true':'false').'" '.
                 'data-solution-theme="'.$this->model->getTheme().'" '.
                 'data-code-theme="'.$this->model->getROTheme().'" '.
                 "data-dom-libs='".json_encode($this->model->getDomLibs())."' ".
                 "data-worker-libs='".json_encode($this->model->getWorkerLibs())."' ".
                 ($readOnly?'data-readonly ':'').
                 'data-output-parser="'.$this->model->getOutputParser().'" '.
                 ($editMode?'data-randomizer-active="'.$this->model->getRandomizerActive().'" ':'').
                 ($editMode?'data-randomizer-preview-index="'.$this->model->getRandomizerPreviewIndex().'" ':'').
                 ($editMode?"data-randomizer-known-tags='".json_encode($this->model->getRandomizerTags())."' ":'').
                 ($editMode?"data-randomizer-sets='".json_encode($this->model->getRandomizerSets())."' ":'').
                 'data-scope-selector="[id=\''.$this->getUUID().'\']" '.
                 '>';

        $html .= '<loading><div></div><div></div></loading>';

        //$set = ($this->model->getRandomizerActive() && $state!=NULL)?$this->model->getRandomSet($state->rid):NULL;
        for ($i=0; $i<$this->model->getNumberOfBlocks(); $i++){            
            $html .= $this->model[$i]->ui()->render($withSolution, $solutions, $state);
        }
            
        $html .= '</div>';
        return $html;
    }

    public function prepareTemplate($tpl, $basePath){
        if (!$tpl->didPrepareBlocks) {
            $tpl->didPrepareBlocks = true;
			$tpl->addInlineCss("codeblockseditor > *,  codeblocks > *, [codeblockseditor] > *,  [codeblocks] > *{ display:none;}");
			$tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/loader.css');
			$tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/roboto.css');
			$tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/main.css');
			$tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/app.css');
            $tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/chunk-vendors.css');
            $tpl->addCss($basePath.'/css/custom.css');

            $tpl->addOnLoadCode("$('head').append('<meta name=\"codeblocks-baseurl\" content=\"" . $basePath . '/'.CODEBLOCKS_REL_PATH."\">');");

			$tpl->addOnLoadCode("import('" . $basePath . '/'.CODEBLOCKS_REL_PATH."js/chunk-vendors.js')");
			$tpl->addOnLoadCode("import('" . $basePath . '/'.CODEBLOCKS_REL_PATH."js/app.js')");
        }	
        
        if (!$tpl->hasLegacyHelpers) {
            if ($this->model->getMinCanvasVersion()<=100) {
                $tpl->addJavaScript($basePath.'/js/legacyHelper.js');
                $tpl->hasLegacyHelpers = true;
            }
        }
    }
}

?>