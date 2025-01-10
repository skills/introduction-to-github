-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2024-12-04 18:01:02.215

-- tables
-- Table: Athlete
CREATE TABLE Athlete (
    Person integer  NOT NULL,
    ID integer  NOT NULL,
    Group_ID integer  NOT NULL,
    CONSTRAINT Athlete_pk PRIMARY KEY (ID)
) ;

-- Table: Coach
CREATE TABLE Coach (
    Person integer  NOT NULL,
    Id integer  NOT NULL,
    Salary integer  NOT NULL,
    Experience timestamp  NOT NULL,
    Successes varchar2(300)  NOT NULL,
    HeadMaster integer  NULL,
    CONSTRAINT Coach_pk PRIMARY KEY (Id)
) ;

-- Table: Group
CREATE TABLE "Group" (
    ID integer  NOT NULL,
    Time timestamp  NOT NULL,
    WeekDays varchar2(25)  NOT NULL,
    ExperienceLevel varchar2(15)  NOT NULL,
    SportHall_ID integer  NOT NULL,
    MonthlyFee integer  NOT NULL,
    Sport_Coach_Coach_Id integer  NOT NULL,
    Sport_Coach_Sport_ID integer  NOT NULL,
    CONSTRAINT Group_pk PRIMARY KEY (ID)
) ;

-- Table: News
CREATE TABLE News (
    ID integer  NOT NULL,
    Name varchar2(20)  NOT NULL,
    Description varchar2(300)  NOT NULL,
    CONSTRAINT News_pk PRIMARY KEY (ID)
) ;

-- Table: Payment
CREATE TABLE Payment (
    ID integer  NOT NULL,
    "Date" date  NOT NULL,
    Amount integer  NOT NULL,
    Description integer  NOT NULL,
    User_ID integer  NOT NULL,
    CONSTRAINT Payment_pk PRIMARY KEY (ID)
) ;

-- Table: Person
CREATE TABLE Person (
    Id integer  NOT NULL,
    Name varchar2(20)  NOT NULL,
    Surname varchar2(20)  NOT NULL,
    BirthDate date  NOT NULL,
    Password varchar2(15)  NOT NULL,
    CONSTRAINT Person_pk PRIMARY KEY (Id)
) ;

-- Table: Sport
CREATE TABLE Sport (
    ID integer  NOT NULL,
    Name varchar2(15)  NOT NULL,
    CONSTRAINT Sport_pk PRIMARY KEY (ID)
) ;

-- Table: SportHall
CREATE TABLE SportHall (
    ID integer  NOT NULL,
    Location varchar2(50)  NOT NULL,
    CONSTRAINT SportHall_pk PRIMARY KEY (ID)
) ;

-- Table: Sport_Coach
CREATE TABLE Sport_Coach (
    Coach_Id integer  NOT NULL,
    Sport_ID integer  NOT NULL,
    CONSTRAINT Sport_Coach_pk PRIMARY KEY (Coach_Id,Sport_ID)
) ;

-- Table: Tournament
CREATE TABLE Tournament (
    ID integer  NOT NULL,
    Name varchar2(20)  NOT NULL,
    "Date" date  NOT NULL,
    CONSTRAINT Tournament_pk PRIMARY KEY (ID)
) ;

-- Table: Tournament_Athlete
CREATE TABLE Tournament_Athlete (
    Athlete_ID integer  NOT NULL,
    Tournament_ID integer  NOT NULL,
    Rank integer  NOT NULL,
    CONSTRAINT Tournament_Athlete_pk PRIMARY KEY (Athlete_ID,Tournament_ID)
) ;

-- foreign keys
-- Reference: Group_SportHall (table: Group)
ALTER TABLE "Group" ADD CONSTRAINT Group_SportHall
    FOREIGN KEY (SportHall_ID)
    REFERENCES SportHall (ID);

-- Reference: Group_Sport_Coach (table: Group)
ALTER TABLE "Group" ADD CONSTRAINT Group_Sport_Coach
    FOREIGN KEY (Sport_Coach_Coach_Id,Sport_Coach_Sport_ID)
    REFERENCES Sport_Coach (Coach_Id,Sport_ID);

-- Reference: Payment_User (table: Payment)
ALTER TABLE Payment ADD CONSTRAINT Payment_User
    FOREIGN KEY (User_ID)
    REFERENCES Athlete (ID);

-- Reference: Sport_Coach_Coach (table: Sport_Coach)
ALTER TABLE Sport_Coach ADD CONSTRAINT Sport_Coach_Coach
    FOREIGN KEY (Coach_Id)
    REFERENCES Coach (Id);

-- Reference: Sport_Coach_Sport (table: Sport_Coach)
ALTER TABLE Sport_Coach ADD CONSTRAINT Sport_Coach_Sport
    FOREIGN KEY (Sport_ID)
    REFERENCES Sport (ID);

-- Reference: Table_2_Person (table: Athlete)
ALTER TABLE Athlete ADD CONSTRAINT Table_2_Person
    FOREIGN KEY (Person)
    REFERENCES Person (Id);

-- Reference: Table_3_Person (table: Coach)
ALTER TABLE Coach ADD CONSTRAINT Table_3_Person
    FOREIGN KEY (Person)
    REFERENCES Person (Id);

-- Reference: Tournament_Athlete_Athlete (table: Tournament_Athlete)
ALTER TABLE Tournament_Athlete ADD CONSTRAINT Tournament_Athlete_Athlete
    FOREIGN KEY (Athlete_ID)
    REFERENCES Athlete (ID);

-- Reference: Tournament_Athlete_Tournament (table: Tournament_Athlete)
ALTER TABLE Tournament_Athlete ADD CONSTRAINT Tournament_Athlete_Tournament
    FOREIGN KEY (Tournament_ID)
    REFERENCES Tournament (ID);

-- Reference: User_Group (table: Athlete)
ALTER TABLE Athlete ADD CONSTRAINT User_Group
    FOREIGN KEY (Group_ID)
    REFERENCES "Group" (ID);

-- End of file.

