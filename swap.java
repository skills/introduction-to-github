
import java.util.Scanner;

public class Swap{
    public static void main(String [] args){
        Scanner mad = new Scanner(System.in);
        System.out.println("Enter the first num");
        int a =mad.nextInt();
        System.err.println("Enter the second num");
        int b =mad.nextInt();
        System.out.println("Number before swapping");
        System.out.print("First num :"+a);
        System.err.print("Second Num"+b);
        int c =a ;
        a = b;
        b = c;
        System.err.println("NUmber After Swapping");
        System.out.println("First Num  : "+a);
         System.out.println("Second Num  : "+b);
    }
}
