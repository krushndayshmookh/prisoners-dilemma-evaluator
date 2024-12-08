# Your code here
print("cooperate", end="\n")

flag = 0

inp = input()

while inp != "stop":
    if inp == 'defect':
        flag = 1
    if flag == 0:
        print("cooperate", end="\n")
    else:
        print("defect", end="\n")
    inp = input()