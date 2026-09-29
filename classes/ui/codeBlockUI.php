<?php

class codeBlockUI {
    //a codeBlock instance
    var $model = null;

    public function __construct($model) {
        $this->model = $model;
    }

    private function saveParamString($str) {
        $str = str_replace("\"", "&quot;", $str);
        return $str;
    }

    private function attr($name, $value) {
        return $name . '="' . htmlspecialchars((string) $value, ENT_QUOTES) . '" ';
    }

    // data-name is optional for most block types
    private function nameAttr() {
        $name = $this->model->getName();
        return ($name === NULL || $name === '') ? '' : $this->attr('data-name', $name);
    }

    public function print($withSolution = false, $solutions = NULL, $state = NULL, $withCtrlChars = true) {
        $type = $this->model->getType();

        if ($type == assCodeQuestionBlockTypes::StaticCode || $type == assCodeQuestionBlockTypes::Text) {
            return '<pre class="static">' . $this->model->printableString($this->getContent($state), $withCtrlChars) . '</pre>';
        } else if ($type == assCodeQuestionBlockTypes::SolutionCode) {
            return $this->renderBlock($withSolution, $solutions, $state, true, $withCtrlChars);
        } else if ($type == assCodeQuestionBlockTypes::Blockly || $type == assCodeQuestionBlockTypes::REPL) {
            return $this->unsupportedMessage(false);
        } else if ($type == assCodeQuestionBlockTypes::Data) {
            return $this->renderDataBlock($withSolution, $solutions, $state, true, $withCtrlChars);
        } else if ($type == assCodeQuestionBlockTypes::Library) {
            return $this->renderLibrary($state, true);
        }

        return '';
    }

    public function getContent($state = NULL, $withSolution = false, $solutions = NULL) {
        return $this->model->getCombinedContent($state, $withSolution, $solutions);
    }

    public function render($withSolution = false, $solutions = NULL, $state = NULL, $editMode = false) {
        $type = $this->model->getType();

        if ($type == assCodeQuestionBlockTypes::StaticCode)
            return $this->renderStaticBlock($state);

        if ($type == assCodeQuestionBlockTypes::HiddenCode)
            return $this->renderHiddenBlock($state);

        if ($type == assCodeQuestionBlockTypes::SolutionCode)
            return $this->renderBlock($withSolution, $solutions, $state, false);

        if ($type == assCodeQuestionBlockTypes::Canvas)
            return $this->renderCanvas($state);

        if ($type == assCodeQuestionBlockTypes::Text)
            return $this->renderText($state);

        if ($type == assCodeQuestionBlockTypes::Blockly || $type == assCodeQuestionBlockTypes::REPL)
            return $this->renderUnsupported($editMode);

        if ($type == assCodeQuestionBlockTypes::Data)
            return $this->renderDataBlock($withSolution, $solutions, $state, false);

        if ($type == assCodeQuestionBlockTypes::Library)
            return $this->renderLibrary($state, false);

        return '';
    }

    private function renderCanvas($state) {
        $html = '<playground ';
        $html .= 'data-version="' . $this->model->getVersion() . '" ' .
            $this->nameAttr() .
            (($this->model->getShouldAutoReset()) ? 'data-should-autoreset ' : '') .
            (($this->model->getShouldReloadResources()) ? 'data-should-reload-resources ' : '') .
            (($this->model->getGenerateTemplate()) ? '' : 'data-generate-template=0 ') .
            ((!$this->model->getExpanded()) ? 'data-expanded=0 ' : '') .
            ('data-code-expanded=' . ($this->model->getCodeExpanded() + 0) . ' ') .
            $this->attr('data-width', $this->model->getWidth()) .
            $this->attr('data-height', $this->model->getHeight()) .
            $this->attr('data-align', $this->model->getAlign());
        $html .= '>' . $this->getContent($state) . "</playground>";
        return $html;
    }

    private function renderBlock($withSolution = false, $solutions = NULL, $state = NULL, $print = false, $withCtrlChars = true) {
        $html = '<';
        if ($print) {
            $html .= 'pre class="solution">';
            $html .= $this->model->printableString($this->getContent($state, $withSolution, $solutions), $withCtrlChars);
            $html .= '</pre>';
        } else {
            $html .= 'block ';
            $html .= 'data-visible-lines="' . $this->model->getLines() . '" ';
            if (!$this->model->getExpanded())
                $html .= 'data-expanded=0 ';
            if ($this->model->getHasAlternativeContent())
                $html .= 'data-alternative-content="' . $this->saveParamString($this->model->getAlternativeContent()) . '" ';

            $html .= '>';
            $html .= $this->getContent($state, $withSolution, $solutions);
            $html .= '</block>';
        }


        return $html;
    }

    private function renderHiddenBlock($state = NULL) {

        return "<block data-hidden" . (!$this->model->getExpanded() ? ' data-expanded=0' : '') . ">" . $this->getContent($state) . "</block>";
    }

    private function renderStaticBlock($state = NULL) {
        return '<block data-static data-visible-lines="auto"' . (!$this->model->getExpanded() ? ' data-expanded=0' : '') . '>' . $this->getContent($state) . "</block>";
    }

    private function renderText($state = NULL) {
        return "<text " . $this->nameAttr() . $this->attr('data-layout', $this->model->getLayout()) . (!$this->model->getExpanded() ? 'data-expanded=0' : '') . ">" . $this->getContent($state) . "</text>";
    }

    private function renderDataBlock($withSolution = false, $solutions = NULL, $state = NULL, $print = false, $withCtrlChars = true) {
        if ($print) {
            return "<div>DataBlock not available in print mode</div>";
        }
        return '<data ' .
            $this->attr('data-name', $this->model->getName()) .
            ((!$this->model->getExpanded()) ? 'data-expanded=0 ' : '') .
            ('data-code-expanded=' . ($this->model->getCodeExpanded() + 0) . ' ') .
            '>' . $this->getContent($state) . "</data>";
    }

    private function txt($key, $default) {
        $plugin = $this->model->object->getPlugin();
        $txt = $plugin !== NULL ? $plugin->txt($key) : '';
        //ILIAS returns -key- for unknown language variables
        return ($txt === '' || $txt[0] === '-') ? $default : $txt;
    }

    private function unsupportedMessage($editMode) {
        $typeName = $this->model->getType() == assCodeQuestionBlockTypes::Blockly ? 'Blockly' : 'REPL';
        $msg = sprintf($this->txt('block_type_unsupported', '%s blocks are no longer supported and can not be displayed.'), $typeName);
        if ($editMode) {
            $msg .= ' ' . $this->txt('block_type_unsupported_edit', 'The content of this block will be lost when you save the question.');
        }
        return '<div class="ilc_Paragraph ilc_text_block_Attention">' . htmlspecialchars($msg) . '</div>';
    }

    /**
     * Blockly and REPL blocks are gone since codeblocks 0.3.0. We still need a block at this
     * position, otherwise codeblocks numbers all following blocks differently than we do.
     */
    private function renderUnsupported($editMode) {
        // codeblocks reads the (HTML) content of a TEXT block from its textContent
        return '<text>' . htmlspecialchars($this->unsupportedMessage($editMode)) . '</text>';
    }

    private function renderLibrary($state = NULL, $print = false) {
        if ($print) {
            return "<div>Library not available in print mode</div>";
        }
        $embedded = $this->model->getEmbeddedLibrary();
        return '<library ' .
            $this->nameAttr() .
            ($embedded !== 'custom' ? $this->attr('data-embedded-library', $embedded) : '') .
            $this->attr('data-library-placement', $this->model->getLibraryPlacement()) .
            'data-version="' . $this->model->getVersion() . '" ' .
            ((!$this->model->getExpanded()) ? 'data-expanded=0 ' : '') .
            ('data-code-expanded=' . ($this->model->getCodeExpanded() + 0) . ' ') .
            '>' . $this->getContent($state) . "</library>";
    }

}

?>