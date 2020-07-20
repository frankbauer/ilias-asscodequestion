package classes.util;

import javax.tools.*;

public class CompileAndRun {
  public static int compile(String className, String javaFile) {
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    String[] args = { javaFile };
    return compiler.run(null, null, null, args);
  }

    public static int run(String name) {
        try {
            Class cl = Class.forName(name);

            java.lang.reflect.Method m = cl.getMethod("main", new Class[] { String[].class });
            m.invoke(null, new Object[] { new String[] {} });
        } catch (ClassNotFoundException e) {
            return -1;
        } catch (NoSuchMethodException e) {
            return -2;
        } catch (IllegalAccessException e) {
            return -3;
        } catch (java.lang.reflect.InvocationTargetException e) {
            return -4;
        }

        return 0;
    }
}
