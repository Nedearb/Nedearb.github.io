
from __future__ import print_function
import periodictable
import sys
import math

table = []

empty = "empty"
star1 = "*"
star2 = "**"

e = 1
table.append(periodictable.elements[e])
e+=1

for i in range(16):
    table.append(empty)

for i in range(1+2):
    table.append(periodictable.elements[e])
    e+=1

for i in range(10):
    table.append(empty)

for i in range(6+2):
    table.append(periodictable.elements[e])
    e+=1

for i in range(10):
    table.append(empty)

for i in range(6+18+18+2):
    table.append(periodictable.elements[e])
    e+=1

table.append(empty)
e += 15

for i in range(15+2):
    table.append(periodictable.elements[e])
    e+=1

table.append(empty)
e += 15

for i in range(9):
    table.append(periodictable.elements[e])
    e+=1

table.append(empty)
e+=1
table.append(periodictable.elements[e])
e+=1
table.append(empty)
e+=1
table.append(periodictable.elements[e])
e+=1
table.append(empty)
e+=1
table.append(empty)
e+=1


for i in range(18):
    table.append(empty)

e = 57
    
table.append(empty)
table.append(star1)

for i in range(15):
    table.append(periodictable.elements[e])
    e+=1

table.append(empty)

e = 89

table.append(empty)
table.append(star1)

for i in range(15):
    table.append(periodictable.elements[e])
    e+=1

table.append(empty)




x = 0
y = 0
i = 0
    
for y in range(10):
    for x in range(18):
        i = x+(y*18)
        if table[i] == empty:
            if table[i-1] != empty:
                print("+       ", end="")
            else:
                print("        ", end="")
        else:
            print("+-------", end="")

    print("\n", end="")

    for x in range(18):
        i = x+(y*18)
        if table[i] == empty:
            if table[i-1] != empty:
                print("|       ", end="")
            else:
                print("        ", end="")
        elif table[i] == star1:
            print("| *     ", end="")
        elif table[i] == star2:
            print("| **    ", end="")
        else:
            print("|"+("{:<3}".format(table[i].symbol))+" "+("{:>3}".format(table[i].number)), end="")

    print("\n", end="")

    for x in range(18):
        i = x+(y*18)
        if table[i] == empty:
            if table[i-1] != empty:
                print("|       ", end="")
            else:
                print("        ", end="")
        elif table[i] == star1:
            print("| 57-71 ", end="")
        elif table[i] == star2:
            print("| 89-103", end="")
        else:
            if len(table[i].name) <= 7:
                name1 = table[i].name
            else:
                name1 = table[i].name[:6]+"-"
            print("|"+("{:<7}".format(name1.capitalize())), end="")

    print("\n", end="")

    for x in range(18):
        i = x+(y*18)
        if table[i] == empty:
            if table[i-1] != empty:
                print("|       ", end="")
            else:
                print("        ", end="")
        elif table[i] == star1:
            print("|       ", end="")
        elif table[i] == star2:
            print("|       ", end="")
        else:
            if len(table[i].name) <= 7:
                name2 = "       "
            else:
                name2 = table[i].name[6:]
            print("|"+("{:<7}".format(name2)), end="")

    print("\n", end="")

    for x in range(18):
        i = x+(y*18)
        if table[i] == empty:
            if table[i-1] != empty:
                print("|       ", end="")
            else:
                print("        ", end="")
        elif table[i] == star1:
            print("|       ", end="")
        elif table[i] == star2:
            print("|       ", end="")
        else:
            if table[i].mass == math.floor(table[i].mass):
                print("| "+"{:^6}".format("["+`table[i].mass`+"]"), end="")
            else:
                print("|"+("{:<7}".format(table[i].mass)[:7]), end="")
    print("\n", end="")

