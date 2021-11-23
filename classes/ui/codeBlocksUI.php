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

    public function print($editMode=false, $readOnly=false, $withSolution=false, $solutions=NULL, $state=NULL, $withCtrlChars=true){
        $html  = '<div printblocks>';
        for ($i=0; $i<$this->model->getNumberOfBlocks(); $i++){
            $html .= $this->model[$i]->ui()->print($withSolution, $solutions, $state, $withCtrlChars);
        }
        $html .= '</div>';
        return $html;
    }

    
    public function render($editMode=false, $readOnly=false, $withSolution=false, $solutions=NULL, $state=NULL){
        $html  = '';
        $html  = '<noscript><div class="ilc_Paragraph ilc_text_block_Attention">You need to enable JavaScript in your Browser to see and use this content!</div></noscript>';
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
                 'data-continuous-compilation="'.($this->model->getContinuousCompilation()?'true':'false').'" '.
                 'data-persistent-arguments="'.($this->model->getPersistentArguments()?'true':'false').'" '.
                 'data-message-passing="'.($this->model->getMessagePassing()?'true':'false').'" '.
                 'data-keep-alive="'.($this->model->getKeepAlive()?'true':'false').'" '.
                 "data-dom-libs='".json_encode($this->model->getDomLibs())."' ".
                 "data-worker-libs='".json_encode($this->model->getWorkerLibs())."' ".
                 ($readOnly?'data-readonly ':'').
                 'data-output-parser="'.$this->model->getOutputParser().'" '.
                 ($editMode?'data-randomizer-active="'.($this->model->getRandomizerActive()?'true':'false').'" ':'').
                 ($editMode?'data-randomizer-preview-index="'.$this->model->getRandomizerPreviewIndex().'" ':'').
                 ($editMode?"data-randomizer-known-tags='".json_encode($this->model->getRandomizerTags())."' ":'').
                 ($editMode?"data-randomizer-sets='".str_replace("'", "&#39;", json_encode($this->model->getRandomizerSets()))."' ":'').
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

    public function mountyJSCode($basePath, $mountOnly=false){
        $loader = 'if (window.mountCodeBlocks) {' . "\n";
        //$loader .= '    console.log("MOUNTING")' . "\n";
        $loader .= '    mountCodeBlocks()' . "\n";
        if ($mountOnly){
            $loader .= '}'."\n";
        } else {
            $loader .= '} else if (!window.codeBlocksJS) {' . "\n";
            //$loader .= '    console.log("IMPORTING")' . "\n";
            $loader .= "    window.codeBlocksJS = true\n";
            $loader .= "    $('head').append('<style>codeblockseditor > *,  codeblocks > *, [codeblockseditor] > *,  [codeblocks] > *{ display:none;}</style>')\n";
            $loader .= "    $('head').append('<meta name=\"codeblocks-baseurl\" content=\"" . $basePath . '/'.CODEBLOCKS_REL_PATH."\">')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"".$basePath."/".CODEBLOCKS_REL_PATH."css/loader.css\" shadow>')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"".$basePath."/".CODEBLOCKS_REL_PATH."css/roboto.css\" shadow>')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"".$basePath."/".CODEBLOCKS_REL_PATH."css/main.css\" shadow>')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"".$basePath."/".CODEBLOCKS_REL_PATH."css/app.css\" shadow>')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"".$basePath."/".CODEBLOCKS_REL_PATH."css/chunk-vendors.css\" shadow>')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"".$basePath."/css/custom.css?&v=2\" shadow>')\n";                   

            $loader .= "    try {\n";
            $loader .= "        import('" . $basePath . '/'.CODEBLOCKS_REL_PATH."js/chunk-vendors.js')\n";
            $loader .= "        import('" . $basePath . '/'.CODEBLOCKS_REL_PATH."js/app.js')\n";
            $loader .= "    } catch (error) {\n";
            $loader .= "        console.error(error)\n";
            $loader .= "        const s = document.createElement('STYLE');\n";
            $loader .= "        s.innerHTML = 'codeblockseditor::before, codeblocks::before, [codeblockseditor]::before, [codeblocks]::before {content:\"\"}'\n"; 
            $loader .= "        Array.prototype.forEach.call(document.getElementsByTagName('loading'),e => {const p = e.parentElement; p.appendChild(s); const c=document.createElement('DIV'); c.className='ilc_Paragraph ilc_text_block_Attention'; c.innerHTML='<b>An Error Occured while loading the Page</b><p>Your Browser does not support this Element. If possible update your browser (the latest Versions of FireFox, Edge, Safari or Chrome should work fine).</p>'; c.style='display:block;height:100%;margin:0'; p.replaceChild(c, e)});\n";           
            $loader .= "    } \n";
            $loader .= '}' . "\n";

            if ($this->model->getMinCanvasVersion()<=100){
                $loader .= 'if (window.processMixedOutput === undefined) {' . "\n";
                $loader .= "    import('" . $basePath . "/js/legacyHelper.js#20200409')\n";
                $loader .= '}' . "\n";
            }
        }

        return $loader;
    }

    public function prepareTemplate($tpl, $basePath){
        if (!$tpl->didPrepareBlocks) {
            $tpl->didPrepareBlocks = true;
			$tpl->addInlineCss("codeblockseditor > *,  codeblocks > *, [codeblockseditor] > *,  [codeblocks] > *{ display:none;}");
			// $tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/loader.css');
			// $tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/roboto.css');
			$tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/main.css');
			// $tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/app.css');
            // $tpl->addCss($basePath.'/'.CODEBLOCKS_REL_PATH.'css/chunk-vendors.css');
            // $tpl->addCss($basePath.'/css/custom.css');

            // $tpl->addOnLoadCode("$('head').append('<meta name=\"codeblocks-baseurl\" content=\"" . $basePath . '/'.CODEBLOCKS_REL_PATH."\">');");

			// $tpl->addOnLoadCode("import('" . $basePath . '/'.CODEBLOCKS_REL_PATH."js/chunk-vendors.js')");
            // $tpl->addOnLoadCode("import('" . $basePath . '/'.CODEBLOCKS_REL_PATH."js/app.js')");
            
            //
            //$tpl->setVariable("MOUNTY", $this->mountyJSCode($basePath, false));
            $tpl->addOnLoadCode($this->mountyJSCode($basePath, false));
        }	
        
        // if (!$tpl->hasLegacyHelpers) {
        //     if ($this->model->getMinCanvasVersion()<=100) {
        //         $tpl->addJavaScript($basePath.'/js/legacyHelper.js');
        //         $tpl->hasLegacyHelpers = true;
        //     }
        // }
    }
}

?>