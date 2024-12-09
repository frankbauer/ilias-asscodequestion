<?php 
    function initPluginObject(string $plugin_name):ilPlugin|null{
        // init the plugin object
        try {
            global $DIC;

            $component_repository = $DIC["component.repository"];
            $component_factory = $DIC["component.factory"];
            $info = $component_repository->getPluginByName($plugin_name);

            $plugin_obj = $component_factory->getPlugin($info->getId());

            if (!is_null($info) && $info->isActive()) {
                return $plugin_obj;
            } else {
                throw new ilPluginException($plugin_name . ' plugin is not active');
            }
        } catch (ilPluginException $e) {
            global $tpl;
            //$tpl->setOnScreenMessage('failure', $e->getMessage(), true);
            return null;
        }
    }
?>