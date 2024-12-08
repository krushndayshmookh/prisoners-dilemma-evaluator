# Your code here
import random

print("cooperate", end="\n")

inp = input()

while inp != "stop":
    print(random.choice(["cooperate", "defect"]), end="\n")
    inp = input()