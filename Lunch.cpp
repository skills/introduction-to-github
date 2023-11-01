#include <iostream>
using namespace std;
#include <math.h>

int power(int a, int b)
{
	int w = 1;
	for (int i = 0; i < b; i++)
		w *= a;
	return w;
};

int main()
{
	int n;
	cin >> n;
	int A[int(log10(n)) + 1];
	for (int i = 0; i < int(log10(n)) + 1; i++)
		A[i] = int(n / power(10, i)) % 10;
	int w = A[int(log10(n))] + A[0] * power(10, int(log10(n)));
	for (int i = int(log10(n)) - 1; i > 0; i--)
		w += A[i] * power(10, i);
	cout << w;
	return 0;
}
