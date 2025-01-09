#include <bits/stdc++.h>
using namespace std;

int main() {
	// your code goes here
  int T;
  cin>>T;
    while(T--){
        int N;
        cin>>N;
        int score=0;
       string A,B;
        
            cin>> A >> B;
            
        
        for(int i=0;i<N;i++){
            if(A[i]=='1' && B[i]=='1'){
                score++;
        }
             if(A[i]=='1' && B[i]=='0' || A[i]=='0' && B[i]=='1')
             {
                 if(score%2==0){
                     score++;
                 }
             }
        }
             if(score % 2== 1){
                 cout<<"YES"<<endl;
             }
             else
             cout<<"NO"<<endl;
    
    }

}
