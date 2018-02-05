package classes.util;

import javax.tools.*;

public class Javac {
  public static void main(String[] args) {
    if (args.length < 1) {
      System.out.println("Syntax: java Javac [classes]");
      return;
    }
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    int result = compiler.run(null, null, null, args);
    if (result != 0) {
      System.out.println("Compiler failed.");      
      System.exit(-100);
    } else if (args.length>0) {
      try {
        String name = args[0].replace(".java", "");
        Class cl = Class.forName(name);
        
        java.lang.reflect.Method m = cl.getMethod("main", new Class[]{String[].class});
        m.invoke(null, new Object[]{new String[]{}});
      } catch (ClassNotFoundException e){
        System.exit(-1);
      } catch (NoSuchMethodException e){
        System.exit(-2);
      } catch (IllegalAccessException e){
        System.exit(-3);
      } catch ( java.lang.reflect.InvocationTargetException e){
        System.exit(-4);
      }
    }
  }
}
