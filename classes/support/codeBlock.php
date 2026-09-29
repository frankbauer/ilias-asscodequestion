<?php

class codeBlock {
	var $object = null;
	var $block = null;
	var $nr = null;

	/**
	 * $block - Data of this block or null if we should create a default set
	 * $object - The paret codeBlocks Object
	 */
	public function __construct($nr, $block, $object) {
		//$object->getPlugin()->includeClass("./ui/codeBlockUI.php");
		$this->object = $object;
		$this->nr = $nr;
		if ($block == null) {
			$this->block = array(
				'type' => assCodeQuestionBlockTypes::StaticCode,
				'content' => ''
			);
		} else {
			$this->block = $block;
		}
	}

	public function getDataVersion() {
		return $this->object->getDataVersion();
	}

	function getRawData() {
		return $this->block;
	}

	function getNr() {
		return $this->nr;
	}

	function getHasAlternativeContent() {
		return isset($this->block['hasAltContent']) ? $this->block['hasAltContent'] : false;
	}

	function setHasAlternativeContent($newValue) {
		$this->block['hasAltContent'] = (bool) $newValue;
	}

	function getAlternativeContent() {
		return isset($this->block['altContent']) ? $this->fixLoadedCode($this->block['altContent']) : '';
	}

	function getAlternativeContentForSet($set) {
		if ($set == NULL)
			return $this->getAlternativeContent();
		return preg_replace_callback(
			CODEBLOCKS_TAG_REGEX,
			function ($treffer) use ($set) {
				return $set[$treffer['name']];
			},
			$this->getAlternativeContent()
		);
	}

	function setAlternativeContent($newValue) {
		$this->block['altContent'] = $newValue;
	}

	function tidyUnusedProperties() {
		$type = $this->getType();
		if ($type != assCodeQuestionBlockTypes::SolutionCode) {
			unset($this->block['lines']);
			unset($this->block['altContent']);
			unset($this->block['hasAltContent']);
		}
		if ($type != assCodeQuestionBlockTypes::Canvas && $type != assCodeQuestionBlockTypes::Blockly) {
			unset($this->block['width']);
			unset($this->block['height']);
			unset($this->block['align']);
		}
		if ($type != assCodeQuestionBlockTypes::Canvas) {
			unset($this->block['autoreset']);
			unset($this->block['reloadResources']);
			unset($this->block['generateTemplate']);
		}
		if ($type != assCodeQuestionBlockTypes::Canvas && $type != assCodeQuestionBlockTypes::Blockly && $type != assCodeQuestionBlockTypes::Library) {
			unset($this->block['version']);
		}
		if ($type != assCodeQuestionBlockTypes::Canvas && $type != assCodeQuestionBlockTypes::Data && $type != assCodeQuestionBlockTypes::Library) {
			unset($this->block['codeExpanded']);
		}
		if ($type != assCodeQuestionBlockTypes::Library) {
			unset($this->block['embeddedLibrary']);
			unset($this->block['libraryPlacement']);
		}
		if ($type != assCodeQuestionBlockTypes::Text) {
			unset($this->block['layout']);
		}
		if ($type != assCodeQuestionBlockTypes::Blockly) {
			unset($this->block['blockly']);
		}
	}

	private static function isTrueOption($value) {
		return $value === true || $value === 1 || $value === '1' || $value === 'true';
	}

	/**
	 * $fallbackType - type to use if the editor did not send one (see setFromPOST in codeBlocks)
	 */
	public static function createFromPreparedPOST($nr, $options, $content, $altContent, $object, $fallbackType = NULL) {
		//the editor does not send every option for every block type
		$opt = function ($name, $default = NULL) use ($options) {
			return isset($options->$name) ? $options->$name : $default;
		};

		$t = $fallbackType ?? assCodeQuestionBlockTypes::StaticCode;
		// codeblocks keeps the type in _type (with a getter named type)
		$type = $opt('type', $opt('_type'));
		if ($type == 'BLOCK') {
			// hidden wins over static, as in codeblocks
			if (self::isTrueOption($opt('hidden')))
				$t = assCodeQuestionBlockTypes::HiddenCode;
			else if (self::isTrueOption($opt('static')))
				$t = assCodeQuestionBlockTypes::StaticCode;
			else
				$t = assCodeQuestionBlockTypes::SolutionCode;
		} else if ($type == 'PLAYGROUND') {
			$t = assCodeQuestionBlockTypes::Canvas;
		} else if ($type == 'TEXT') {
			$t = assCodeQuestionBlockTypes::Text;
		} else if ($type == 'BLOCKLY') {
			$t = assCodeQuestionBlockTypes::Blockly;
			if (isset($options->blockly) && is_object($options->blockly)) {
				//convert from std class (object) to array				
				$ar = [];
				foreach ($options->blockly as $i => $val) {
					$ar[$i] = $val;
				}
				$options->blockly = $ar;
			}
		} else if ($type == 'REPL') {
			$t = assCodeQuestionBlockTypes::REPL;
		} else if ($type == 'DATA') {
			$t = assCodeQuestionBlockTypes::Data;
		} else if ($type == 'LIBRARY') {
			$t = assCodeQuestionBlockTypes::Library;
		}

		$data = array(
			'expanded' => $opt('expanded') === NULL || self::isTrueOption($opt('expanded')),
			'codeExpanded' => (int) $opt('codeExpanded', 1),
			'type' => $t,
			'content' => codeBlock::fixSentCode($content ?? ''),
			'lines' => $opt('visibleLines', 'auto'),
			'width' => $opt('width'),
			'height' => $opt('height'),
			'name' => $opt('name', ''),
			'align' => $opt('align'),
			'version' => $opt('version'),
			'autoreset' => self::isTrueOption($opt('shouldAutoreset')),
			'reloadResources' => self::isTrueOption($opt('shouldReloadResources')),
			'generateTemplate' => $opt('generateTemplate') === NULL || self::isTrueOption($opt('generateTemplate')),
			'hasAltContent' => self::isTrueOption($opt('hasAlternativeContent')),
			'altContent' => $altContent,
			'layout' => $opt('layout', 'auto'),
			'embeddedLibrary' => $opt('embeddedLibrary', 'custom'),
			'libraryPlacement' => $opt('libraryPlacement', 'inline'),
			'blockly' => $opt('blockly'),
		);

		$o = new codeBlock($nr, $data, $object);
		$o->tidyUnusedProperties();

		return $o;
	}

	var $ui = null;
	function ui() {
		if ($this->ui == null) {
			$this->ui = new codeBlockUI($this);
		}
		return $this->ui;
	}

	public function printableString($value, $withCtrlChars = true) {
		// $value = str_replace("\t", "  ",$value);
		// $value = str_replace(" ", "&nbsp;",$value);
		// $value = str_replace("\n", "<br />", $value);
		$value = str_replace("\r", "", $value);
		if ($withCtrlChars) {
			$value = str_replace("\n", "↵\n", $value);
			$value = str_replace("\t", "↦\t", $value);
		}

		return $value;
	}

	static public function fixCodeForExport($str) {
		return str_replace('>', '&gt;', str_replace('<', '&lt;', str_replace('{', '&#123;', str_replace('&', '&#38;', $str))));
	}

	static public function fixExportedCode($str) {
		return str_replace('&gt;', '>', str_replace('&lt;', '<', str_replace('&#123;', '{', str_replace('&amp;', '&', str_replace('&#38;', '&', $str)))));
	}

	function fixLoadedCode($str) {
		//return str_replace('<', '&lt;',$str);
		return str_replace('<', '&lt;', str_replace('{', '&#123;', $str));
		//return str_replace('<br />', '', str_replace('&lt;', '<', is_string($str) ? $str : ''));
	}

	static function fixSentCode($str) {
		//return str_replace('<', '&lt;', $str);
		return str_replace('&#123;', '{', str_replace('&', '&#38;', $str));
	}

	public function __get($property) {
		return $this->block[$porperty];
	}

	public function __set($property, $value) {
		if (property_exists($this, $property)) {
			return $this->block[$porperty] = $value;
		}

		return $this;
	}

	function getName() {
		return isset($this->block['name']) ? $this->block['name'] : '';
	}

	function setName($value) {
		$this->block['name'] = $value;
	}

	function getLines() {
		if (!isset($this->block['lines']))
			return 'auto';

		$res = $this->block['lines'];
		if ($res == 'auto')
			return 'auto';
		try {
			$res += 0;
		} catch (Error $e) {
			$res = 0;
		}
		if ($res == 0)
			$res = 10;
		return $res;
	}

	function setLines($value) {
		$this->block['lines'] = $value;
	}

	function getBlockly() {
		if (!isset($this->block['blockly'])) {
			return ["toolbox" => [], "categories" => [], "blocks" => []];
		}
		return $this->block['blockly'];
	}

	function getToolbox() {
		$bl = $this->getBlockly();
		return $bl['toolbox'];
	}

	function getToolboxOverride() {
		$bl = $this->getBlockly();
		return $bl['toolboxOverride'];
	}

	function getCustomBlocks() {
		$bl = $this->getBlockly();
		return $bl['blocks'];
	}

	function getBlocklyShowControls() {
		$bl = $this->getBlockly();
		if (!isset($bl['showControls']))
			return false;
		return $bl['showControls'];
	}

	function getExpanded() {
		if (!isset($this->block['expanded']))
			return true;
		return $this->block['expanded'];
	}

	function setExpanded($value) {
		$this->block['expanded'] = $value;
	}

	function getCodeExpanded() {
		if (!isset($this->block['codeExpanded']))
			return 1;
		return $this->block['codeExpanded'];
	}

	function setCodeExpanded($value) {
		$this->block['codeExpanded'] = $value;
	}

	function getShouldAutoReset() {
		if (!isset($this->block['autoreset']))
			return false;
		return $this->block['autoreset'];
	}

	function setShouldAutoReset($value) {
		$this->block['autoreset'] = $value;
	}

	function getGenerateTemplate() {
		if (!isset($this->block['generateTemplate']))
			return true;
		return $this->block['generateTemplate'];
	}

	function setGenerateTemplate($value) {
		$this->block['generateTemplate'] = $value;
	}

	function getType() {
		return $this->block['type'];
	}

	function setType($value) {
		$this->block['type'] = $value;
	}


	public function getCombinedContent($state = NULL, $withSolution = false, $solutions = NULL) {
		$nr = $this->getNr();
		$altContent = NULL;
		if ($state != NULL && isset($state->blocks)) {
			if ($state->blocks != NULL) {
				$altContent = $this->fixLoadedCode($state->blocks[$nr]);
			} else if ($withSolution && !$this->getHasAlternativeContent()) {
				// Hm, where was this important. This will print the best Solution in the 
				// Solution view if the student did not answer the question.
				// Replaced with an empty string to prevent that!!!
				//$altContent = $this->getContent(); 
				$altContent = '';
			} else if (
				$state->blocks == NULL
				&& $this->object->getRandomizerActive()
			) {
				//this case makes sure, that we never display 
				//placeholders in student solutions, even if the question was 
				//never opened and thus we did not generate a random set.
				$set = $this->object->getRandomSet(-1);

				if ($this->getHasAlternativeContent())
					$altContent = $this->getAlternativeContentForSet($set);
				else
					$altContent = $this->getContentForSet($set);
			}
		}

		if ($withSolution) {
			if (is_object($solutions)) {
				return $this->fixLoadedCode($solutions->$nr);
			} else if (is_array($solutions)) {
				return $this->fixLoadedCode($solutions[$nr]);
			}

			if ($altContent != NULL) {
				return $altContent;
			}
			if ($this->getHasAlternativeContent()) {
				return $this->getAlternativeContent();
			}
			return '';
		}

		if ($altContent == NULL) {
			return $this->getContent();
		}

		return $altContent;
	}

	function getContent() {
		return $this->fixLoadedCode($this->block['content']);
	}

	function getContentForSet($set) {
		if ($set == NULL)
			return $this->getContent();
		return preg_replace_callback(
			CODEBLOCKS_TAG_REGEX,
			function ($treffer) use ($set) {
				return $set[$treffer['name']];
			},
			$this->getContent()
		);
	}

	function setContent($value) {
		$this->block['content'] = $value;
	}

	function getVersion() {
		if ($this->getDataVersion() == 100) {
			return '100';
		}

		if (!isset($this->block['version']))
			return '101';
		return $this->block['version'];
	}

	function getWidth() {
		if (!isset($this->block['width']))
			return '100%';
		return $this->block['width'];
	}

	function getHeight() {
		if (!isset($this->block['height']))
			return '200px';
		return $this->block['height'];
	}

	function getAlign() {
		if (!isset($this->block['align']))
			return 'left';
		return $this->block['align'];
	}

	function getShouldReloadResources() {
		if (!isset($this->block['reloadResources']))
			return false;
		return $this->block['reloadResources'];
	}

	function setShouldReloadResources($value) {
		$this->block['reloadResources'] = (bool) $value;
	}

	/**
	 * Layout of a TEXT block while editing: auto, vertical or horizontal
	 */
	function getLayout() {
		if (!isset($this->block['layout']) || !in_array($this->block['layout'], ['auto', 'vertical', 'horizontal']))
			return 'auto';
		return $this->block['layout'];
	}

	function setLayout($value) {
		$this->block['layout'] = $value;
	}

	/**
	 * Id of the built-in library a LIBRARY block uses, or 'custom' if it uses its own content
	 */
	function getEmbeddedLibrary() {
		if (!isset($this->block['embeddedLibrary']) || !is_string($this->block['embeddedLibrary']) || $this->block['embeddedLibrary'] === '')
			return 'custom';
		return $this->block['embeddedLibrary'];
	}

	function setEmbeddedLibrary($value) {
		$this->block['embeddedLibrary'] = $value;
	}

	/**
	 * Where a LIBRARY block renders its UI: inline, aboveOutput or belowOutput
	 */
	function getLibraryPlacement() {
		if (!isset($this->block['libraryPlacement']) || !in_array($this->block['libraryPlacement'], ['inline', 'aboveOutput', 'belowOutput']))
			return 'inline';
		return $this->block['libraryPlacement'];
	}

	function setLibraryPlacement($value) {
		$this->block['libraryPlacement'] = $value;
	}
}

?>