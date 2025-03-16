# GAME OF MIND (GUESSING CORRECT NO)

num = random.randrange(500, 50000)

n = int(input("guess any 4 digit number"))

if (n == num):
    print("EXCELLENT!! YOU HAVE GUESSED THE RIGHT NUMBER")

else:
    ctr = 0

while (n !=num):
#while loop will continue to give try to user till he gets the correct number 
   ctr+=1
   count = 0

   correct = ['x']*5

for i in range(0,5):
    if (n[i] ==num[i]):
        count += 1
        correct[i] = n[i]
else:
    continue

print("not the correct number,but you get ",count ,"digit correct!")
print("\n")

n=int(input("enter your another choice"))

    elif (count == 0):
     print("number you entered is incorrect")

n = int(input("Enter your another choice"))
if n == num:
    ctr += 1
    print("YOU CORRECTLY GUESSED THE NUMBER")
    print("you took",ctr,"tries.")
