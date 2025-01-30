import java.util.Scanner;
public class Rect{
    public static void main (String [] args){
    Scanner mad = new Scanner(System.in);
    System.out.println("Enter the length : ");
    int len = mad.nextInt();
     System.out.println("Enter the width : ");
     int wid =mad.nextInt();
     int res = len*wid;
      System.out.println("The Area of Rectangle is " + res);
    }
}
