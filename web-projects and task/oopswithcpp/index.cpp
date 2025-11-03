#include <iostream>
#include <string>
using namespace std;

// Base class Person
class Person {
protected:
    string sex;
    int age;
    double heightFt;
    double heightIn;

public:
    Person() : sex(""), age(0), heightFt(0), heightIn(0) {}

    // Overloaded getInput: interactive input
    virtual void getInput() {
        cout << "Enter sex (e.g., Male/Female): ";
        getline(cin, sex);
        cout << "Enter age (years): ";
        cin >> age;
        cout << "Enter height - feet: ";
        cin >> heightFt;
        cout << "Enter height - inches: ";
        cin >> heightIn;
        cin.ignore(); // Clear newline left in input buffer
    }

    // Overloaded getInput: params input
    void getInput(string s, int a, double ft, double inch) {
        sex = s;
        age = a;
        heightFt = ft;
        heightIn = inch;
    }

    virtual void display() const {
        cout << "Sex: " << sex << "\n";
        cout << "Age: " << age << " years\n";
        cout << "Height: " << heightFt << " ft " << heightIn << " in\n";
    }
};

// Derived class BMI_Calculator
class BMI_Calculator : public Person {
private:
    double weight;
    string unit;
    double heightMeters;
    double bmi;

    void convertToMeters() {
        heightMeters = ((heightFt * 12) + heightIn) * 0.0254;
    }

    void convertPoundsToKg() {
        if (unit == "lb" || unit == "lbs") {
            weight *= 0.453592;  // Convert pounds to kg
        }
    }

    void calculateBMI() {
        bmi = weight / (heightMeters * heightMeters);
    }

public:
    BMI_Calculator() : weight(0), unit("kg"), heightMeters(0), bmi(0) {}

    // Override getInput for weight and unit
    void getInput() override {
        Person::getInput();
        cout << "Enter weight: ";
        cin >> weight;
        cout << "Is the weight in kilograms or pounds? (kg/lb): ";
        cin >> unit;
        cin.ignore();
    }

    // Overloaded getInput with parameters, including weight and unit
    void getInput(string s, int a, double ft, double inch, double w, string u) {
        Person::getInput(s, a, ft, inch);
        weight = w;
        unit = u;
    }

    void process() {
        convertToMeters();
        convertPoundsToKg();
        calculateBMI();
    }

    void display() const override {
        Person::display();
        cout << "Weight: " << weight << " kg\n";
        cout << "BMI: " << bmi << "\n";
        cout << "Status: ";
        if (bmi < 18.5) cout << "Underweight\n";
        else if (bmi < 25) cout << "Normal weight\n";
        else if (bmi < 30) cout << "Overweight\n";
        else cout << "Obese\n";
    }

    friend ostream& operator<<(ostream& os, const BMI_Calculator& obj) {
        obj.display();
        return os;
    }
};

int main() {
    BMI_Calculator calculator;

    // Use interactive input
    calculator.getInput();
    calculator.process();
    cout << calculator;

    // Or test overloaded function input (uncomment below)
    /*
    calculator.getInput("Female", 30, 5, 4, 130, "lb");
    calculator.process();
    cout << calculator;
    */

    return 0;
}