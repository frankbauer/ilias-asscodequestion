<?php

class codeBlocksUI {
    //a codeBlock instance
    var $model = null;
    var $uuid = null;
    var $PREPARED_TEMPLATES = [];
    //true: form fields are named block_<id>_<nr> instead of block[<id>][<nr>] (see data-field-names in the codeblocks wiki)
    var $flatFieldNames = false;

    public function __construct($model) {
        $this->uuid = $model->guidv4() . '-' . $model->getId();
        $this->model = $model;
    }



    public function getUUID() {
        return $this->uuid;
    }

    public function setUUID($newUUID) {
        $this->uuid = $newUUID;
    }

    /**
     * URL of a file of this plugin, with a version parameter that changes whenever the file is
     * deployed again (the codeblocks version alone stays the same across builds, so browsers
     * would keep using a cached bundle)
     *
     * @param string $relFile path relative to the plugin directory, e.g. 'css/custom.css'
     */
    private function assetUrl(string $basePath, string $relFile): string {
        $mtime = @filemtime(dirname(__DIR__, 2) . '/' . $relFile);
        return $basePath . '/' . $relFile . '?v=' . CODEBLOCKS_VERSION . ($mtime ? '-' . $mtime : '');
    }

    public function setFlatFieldNames(bool $flat) {
        $this->flatFieldNames = $flat;
    }

    public function print($editMode = false, $readOnly = false, $withSolution = false, $solutions = NULL, $state = NULL, $withCtrlChars = true) {
        $html = '<div printblocks>';
        for ($i = 0; $i < $this->model->getNumberOfBlocks(); $i++) {
            $html .= $this->model[$i]->ui()->print($withSolution, $solutions, $state, $withCtrlChars);
        }
        $html .= '</div>';
        return $html;
    }


    public function render($editMode = false, $readOnly = false, $withSolution = false, $solutions = NULL, $state = NULL) {
        $html = '';
        $html = '<noscript><div class="ilc_Paragraph ilc_text_block_Attention">You need to enable JavaScript in your Browser to see and use this content!</div></noscript>';
        $html .= '<style>.c-layout-alignment--horizontal-evenly .c-layout-alignment__block { flex:0 1 auto; }</style>';
        $html .= '<div ' . ($editMode ? 'codeblockseditor ' : 'codeblocks ');
        $html .= 'data-question="' . $this->model->getId() . '" ' .
            'data-compiler="' . $this->model->getCompilerLanguage() . '" ' .
            'data-compiler-version="' . $this->model->getCompilerVersion() . '" ' .
            'data-language="' . $this->model->getLanguage() . '" ' .
            'data-execution-timeout="' . $this->model->getTimeoutMS() . '" ' .
            'data-max-characters="' . $this->model->getMaxChars() . '" ' .
            'data-run-code="' . ($this->model->getAllowRun() ? 'true' : 'false') . '" ' .
            // codeblocks only falls back to the legacy themes if data-ui-theme is missing
            ($this->model->getUITheme() !== NULL ? 'data-ui-theme="' . $this->model->getUITheme() . '" ' : '') .
            'data-solution-theme="' . $this->model->getTheme() . '" ' .
            'data-code-theme="' . $this->model->getROTheme() . '" ' .
            'data-enable-completion-in-view-mode="' . ($this->model->getEnableCompletionInViewMode() ? 'true' : 'false') . '" ' .
            'data-emit-ast="' . ($this->model->getEmitAST() ? 'true' : 'false') . '" ' .
            'data-continuous-compilation="' . ($this->model->getContinuousCompilation() ? 'true' : 'false') . '" ' .
            'data-persistent-arguments="' . ($this->model->getPersistentArguments() ? 'true' : 'false') . '" ' .
            'data-message-passing="' . ($this->model->getMessagePassing() ? 'true' : 'false') . '" ' .
            'data-keep-alive="' . ($this->model->getKeepAlive() ? 'true' : 'false') . '" ' .
            "data-dom-libs='" . json_encode($this->model->getDomLibs()) . "' " .
            "data-worker-libs='" . json_encode($this->model->getWorkerLibs()) . "' " .
            ($readOnly ? 'data-readonly ' : '') .
            ($this->flatFieldNames ? 'data-field-names="flat" ' : '') .
            'data-output-parser="' . $this->model->getOutputParser() . '" ' .
            ($editMode ? 'data-randomizer-active="' . ($this->model->getRandomizerActive() ? 'true' : 'false') . '" ' : '') .
            ($editMode ? 'data-randomizer-preview-index="' . $this->model->getRandomizerPreviewIndex() . '" ' : '') .
            ($editMode ? "data-randomizer-known-tags='" . json_encode($this->model->getRandomizerTags()) . "' " : '') .
            ($editMode ? "data-randomizer-sets='" . str_replace("'", "&#39;", json_encode($this->model->getRandomizerSets())) . "' " : '') .
            'data-scope-selector="[id=\'' . $this->getUUID() . '\']" ' .
            '>';

        $html .= '<loading><div></div><div></div></loading>';

        //$set = ($this->model->getRandomizerActive() && $state!=NULL)?$this->model->getRandomSet($state->rid):NULL;
        for ($i = 0; $i < $this->model->getNumberOfBlocks(); $i++) {
            $html .= $this->model[$i]->ui()->render($withSolution, $solutions, $state, $editMode);
        }

        $html .= '</div>';
        return $html;
    }

    public function mountyJSCode($basePath, $mountOnly = false): string {
        $loader = "if (typeof $ !== 'undefined') {\n";
        $loader .= "// Make sure that the codeblocks are expanded, otherwise the codemirror text boxes will not load properly!!\n";
        $loader .= "const expandable = $('div.il-table-presentation-row-expanded')\n";
        $loader .= "if (expandable!==undefined && expandable.find('div.blockParent')!==undefined) {\n";
        $loader .= "    expandable.css('display', 'block')\n";
        $loader .= "}\n";
        $loader .= 'if (window.codeblocks) {' . "\n";
        $loader .= '    window.codeblocks.loadAndMount()' . "\n";
        if ($mountOnly) {
            $loader .= '}' . "\n";
        } else {
            $lib = CODEBLOCKS_REL_PATH . 'js/codeblocks-js/';
            $loader .= '} else if (!window.codeBlocksJS) {' . "\n";
            $loader .= "    window.codeBlocksJS = true\n";
            $loader .= "    $('head').append('<style>codeblockseditor > *,  codeblocks > *, [codeblockseditor] > *,  [codeblocks] > *{ display:none;}</style>')\n";
            $loader .= "    $('head').append('<meta name=\"codeblocks-baseurl\" content=\"" . $basePath . '/' . CODEBLOCKS_REL_PATH . "\">')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $this->assetUrl($basePath, $lib . 'codeblocks.css') . "\" shadow>')\n";
            $loader .= "    $('head').append('<link rel=\"stylesheet\" type=\"text/css\" href=\"" . $this->assetUrl($basePath, 'css/custom.css') . "\" shadow>')\n";

            // the library mounts all blocks on the page once it is loaded
            $loader .= "    import('" . $this->assetUrl($basePath, $lib . 'codeblocks.umd.js') . "').catch(function (error) {\n";
            $loader .= "        console.error(error)\n";
            $loader .= "        const s = document.createElement('STYLE');\n";
            $loader .= "        s.innerHTML = 'codeblockseditor::before, codeblocks::before, [codeblockseditor]::before, [codeblocks]::before {content:\"\"}'\n";
            $loader .= "        Array.prototype.forEach.call(document.getElementsByTagName('loading'),e => {const p = e.parentElement; p.appendChild(s); const c=document.createElement('DIV'); c.className='ilc_Paragraph ilc_text_block_Attention'; c.innerHTML='<b>An Error Occured while loading the Page</b><p>Your Browser does not support this Element. If possible update your browser (the latest Versions of FireFox, Edge, Safari or Chrome should work fine).</p>'; c.style='display:block;height:100%;margin:0'; p.replaceChild(c, e)});\n";
            $loader .= "    })\n";
            $loader .= '}' . "\n";

            if ($this->model->getMinCanvasVersion() <= 100) {
                $loader .= 'if (window.processMixedOutput === undefined) {' . "\n";
                $loader .= "    import('" . $this->assetUrl($basePath, 'js/legacyHelper.js') . "')\n";
                $loader .= '}' . "\n";
            }
        }
        $loader .= '}' . "\n";

        return $loader;
    }
    public function prepareTemplate($tpl, $basePath) {
        if ($tpl == null) {
            return;
        }

        if (!in_array($tpl, $this->PREPARED_TEMPLATES)) {
            $this->PREPARED_TEMPLATES[] = $tpl;

            $inline_css = "codeblockseditor > *,  codeblocks > *, [codeblockseditor] > *,  [codeblocks] > *{ display:none;}";
            $css_file = $this->assetUrl($basePath, CODEBLOCKS_REL_PATH . 'js/codeblocks-js/codeblocks.css');
            $on_load_code = $this->mountyJSCode($basePath, false);

            if ($tpl instanceof ilGlobalTemplateInterface) {
                iljQueryUtil::initjQuery($tpl);
                $tpl->addInlineCss($inline_css);
                // no addCss($css_file): ILIAS replaces the query of added stylesheets with its own
                // version parameter, so the file would stay cached across deploys. The loader in
                // $on_load_code adds the stylesheet with the versioned URL.
                $tpl->addOnLoadCode($on_load_code);
            } else {
                // set onLoadCode
                $tpl->setCurrentBlock("on_load_code");
                $tpl->setCurrentBlock("on_load_code_inner");
                $tpl->setVariable("OLCODE", $on_load_code);
                $tpl->parseCurrentBlock();
                $tpl->setCurrentBlock("on_load_code");
                $tpl->parseCurrentBlock();

                // inline css
                $tpl->setCurrentBlock("css_inline");
                $tpl->setVariable("CSS_INLINE", $inline_css);
                $tpl->parseCurrentBlock();

                // css files                                
                $tpl->setCurrentBlock("css_file");
                $tpl->setVariable("CSS_FILE", $css_file);
                $tpl->setVariable("CSS_MEDIA", "screen");
                $tpl->parseCurrentBlock();
            }
        }
    }
}

?>