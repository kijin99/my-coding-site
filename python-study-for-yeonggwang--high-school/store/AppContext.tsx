import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { Problem, Submission, Classroom, Student, TeachingMaterial, User } from '../types';

interface NewStudentData {
  name: string;
  username: string;
  password?: string;
  studentNumber?: string;
}

interface AppContextType {
  problems: Problem[];
  submissions: Submission[];
  classrooms: Classroom[];
  students: Student[];
  materials: TeachingMaterial[];
  users: User[];
  currentUser: User | null;
  addProblem: (problem: Omit<Problem, 'id'>) => void;
  updateProblem: (problemId: string, updatedData: Partial<Omit<Problem, 'id'>>) => void;
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt'>) => void;
  addClassroom: (name: string) => void;
  addStudentToClassroom: (studentData: NewStudentData, classroomId: string) => string | null;
  addStudentsToClassroom: (studentData: NewStudentData[], classroomId: string) => string | null;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id'>>) => string | null;
  addMaterial: (name: string, description: string, file: File) => void;
  deleteMaterial: (materialId: string) => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialStudents: Student[] = [
    { id: 's1', name: 'Alice', username: 'alice', password: 'password123', studentNumber: '2024001' },
    { id: 's2', name: 'Bob', username: 'bob', password: 'password123', studentNumber: '2024002' },
    { id: 's3', name: 'Charlie', username: 'charlie', password: 'password123', studentNumber: '2024003' },
    { id: 's4', name: 'Diana', username: 'diana', password: 'password123', studentNumber: '2024004' },
];

const initialClassrooms: Classroom[] = [
    { id: 'c1', name: 'Period 1 - Intro to Python', studentIds: ['s1', 's2'] },
    { id: 'c2', name: 'Period 3 - Advanced Python', studentIds: ['s3', 's4'] },
];

const initialProblems: Problem[] = [
  {
    id: 'p1',
    title: 'Hello, World!',
    description: 'Write a Python function `greet()` that returns the string "Hello, World!".',
    titleKey: 'problems.p1.title',
    descriptionKey: 'problems.p1.description',
    hintKey: 'problems.p1.hint',
    initialCode: 'def greet():\n  # Your code here\n  pass',
  },
  {
    id: 'p2',
    title: 'Sum of Two Numbers',
    description: 'Write a Python function `sum_two(a, b)` that takes two numbers `a` and `b` as input and returns their sum.',
    titleKey: 'problems.p2.title',
    descriptionKey: 'problems.p2.description',
    hintKey: 'problems.p2.hint',
    initialCode: 'def sum_two(a, b):\n  # Your code here\n  pass',
  },
  {
    id: 'p3',
    title: 'Subtract Two Numbers',
    description: 'Write a Python function `subtract(a, b)` that takes two numbers `a` and `b` and returns their difference (a - b).',
    titleKey: 'problems.p3.title',
    descriptionKey: 'problems.p3.description',
    hintKey: 'problems.p3.hint',
    initialCode: 'def subtract(a, b):\n  # Your code here\n  pass',
  },
  {
    id: 'p4',
    title: 'Multiply Two Numbers',
    description: 'Write a Python function `multiply(a, b)` that returns the product of two numbers `a` and `b`.',
    titleKey: 'problems.p4.title',
    descriptionKey: 'problems.p4.description',
    hintKey: 'problems.p4.hint',
    initialCode: 'def multiply(a, b):\n  # Your code here\n  pass',
  },
  {
    id: 'p5',
    title: 'Check for Even Number',
    description: 'Write a function `is_even(number)` that returns `True` if the number is even, and `False` otherwise.',
    titleKey: 'problems.p5.title',
    descriptionKey: 'problems.p5.description',
    hintKey: 'problems.p5.hint',
    initialCode: 'def is_even(number):\n  # Your code here\n  pass',
  },
  {
    id: 'p6',
    title: 'Find Maximum of Two',
    description: 'Write a function `max_of_two(a, b)` that returns the larger of the two numbers.',
    titleKey: 'problems.p6.title',
    descriptionKey: 'problems.p6.description',
    hintKey: 'problems.p6.hint',
    initialCode: 'def max_of_two(a, b):\n  # Your code here\n  pass',
  },
  {
    id: 'p7',
    title: 'String Length',
    description: 'Write a function `get_string_length(s)` that returns the length of a given string `s`.',
    titleKey: 'problems.p7.title',
    descriptionKey: 'problems.p7.description',
    hintKey: 'problems.p7.hint',
    initialCode: 'def get_string_length(s):\n  # Your code here\n  pass',
  },
  {
    id: 'p8',
    title: 'Reverse a String',
    description: 'Write a function `reverse_string(s)` that takes a string `s` and returns the reversed string.',
    titleKey: 'problems.p8.title',
    descriptionKey: 'problems.p8.description',
    hintKey: 'problems.p8.hint',
    initialCode: 'def reverse_string(s):\n  # Your code here\n  pass',
  },
  {
    id: 'p9',
    title: 'First Element of a List',
    description: 'Write a function `get_first_element(lst)` that returns the first element of a list `lst`.',
    titleKey: 'problems.p9.title',
    descriptionKey: 'problems.p9.description',
    hintKey: 'problems.p9.hint',
    initialCode: 'def get_first_element(lst):\n  # Your code here\n  pass',
  },
  {
    id: 'p10',
    title: 'Sum of List Elements',
    description: 'Write a function `sum_list(numbers)` that returns the sum of all numbers in a list.',
    titleKey: 'problems.p10.title',
    descriptionKey: 'problems.p10.description',
    hintKey: 'problems.p10.hint',
    initialCode: 'def sum_list(numbers):\n  # Your code here\n  pass',
  },
  {
    id: 'p11',
    title: 'Celsius to Fahrenheit',
    description: 'Write a function `celsius_to_fahrenheit(celsius)` that converts Celsius to Fahrenheit. Formula: (C * 9/5) + 32.',
    titleKey: 'problems.p11.title',
    descriptionKey: 'problems.p11.description',
    hintKey: 'problems.p11.hint',
    initialCode: 'def celsius_to_fahrenheit(celsius):\n  # Your code here\n  pass',
  },
  {
    id: 'p12',
    title: 'Count Vowels',
    description: 'Write a function `count_vowels(s)` that counts the number of vowels (a, e, i, o, u) in a string.',
    titleKey: 'problems.p12.title',
    descriptionKey: 'problems.p12.description',
    hintKey: 'problems.p12.hint',
    initialCode: 'def count_vowels(s):\n  # Your code here\n  pass',
  },
  {
    id: 'p13',
    title: 'Palindrome Check',
    description: 'Write a function `is_palindrome(s)` that checks if a string is a palindrome (reads the same forwards and backwards).',
    titleKey: 'problems.p13.title',
    descriptionKey: 'problems.p13.description',
    hintKey: 'problems.p13.hint',
    initialCode: 'def is_palindrome(s):\n  # Your code here\n  pass',
  },
  {
    id: 'p14',
    title: 'Factorial',
    description: 'Write a function `factorial(n)` that computes the factorial of a non-negative integer `n`.',
    titleKey: 'problems.p14.title',
    descriptionKey: 'problems.p14.description',
    hintKey: 'problems.p14.hint',
    initialCode: 'def factorial(n):\n  # Your code here\n  pass',
  },
  {
    id: 'p15',
    title: 'Find in List',
    description: 'Write a function `find_element(lst, element)` that returns `True` if the element is in the list, `False` otherwise.',
    titleKey: 'problems.p15.title',
    descriptionKey: 'problems.p15.description',
    hintKey: 'problems.p15.hint',
    initialCode: 'def find_element(lst, element):\n  # Your code here\n  pass',
  },
  {
    id: 'p16',
    title: 'Average of List',
    description: 'Write a function `calculate_average(numbers)` that returns the average of a list of numbers.',
    titleKey: 'problems.p16.title',
    descriptionKey: 'problems.p16.description',
    hintKey: 'problems.p16.hint',
    initialCode: 'def calculate_average(numbers):\n  # Your code here\n  pass',
  },
  {
    id: 'p17',
    title: 'String to Uppercase',
    description: 'Write a function `to_uppercase(s)` that converts a string to uppercase.',
    titleKey: 'problems.p17.title',
    descriptionKey: 'problems.p17.description',
    hintKey: 'problems.p17.hint',
    initialCode: 'def to_uppercase(s):\n  # Your code here\n  pass',
  },
  {
    id: 'p18',
    title: 'Area of Circle',
    description: 'Write a function `circle_area(radius)` that calculates the area of a circle. Use `3.14159` for pi.',
    titleKey: 'problems.p18.title',
    descriptionKey: 'problems.p18.description',
    hintKey: 'problems.p18.hint',
    initialCode: 'def circle_area(radius):\n  # Your code here\n  pass',
  },
  {
    id: 'p19',
    title: 'Check for Substring',
    description: 'Write a function `contains_substring(main_str, sub_str)` that returns `True` if `main_str` contains `sub_str`.',
    titleKey: 'problems.p19.title',
    descriptionKey: 'problems.p19.description',
    hintKey: 'problems.p19.hint',
    initialCode: 'def contains_substring(main_str, sub_str):\n  # Your code here\n  pass',
  },
  {
    id: 'p20',
    title: 'FizzBuzz',
    description: 'Write a function `fizzbuzz(n)` that returns "Fizz" if n is divisible by 3, "Buzz" if by 5, "FizzBuzz" if by both, and the number itself otherwise.',
    titleKey: 'problems.p20.title',
    descriptionKey: 'problems.p20.description',
    hintKey: 'problems.p20.hint',
    initialCode: 'def fizzbuzz(n):\n  # Your code here\n  pass',
  },
  {
    id: 'p21',
    title: 'Get Dictionary Value',
    description: 'Write a function `get_value(d, key)` that returns the value for a given key in a dictionary `d`.',
    titleKey: 'problems.p21.title',
    descriptionKey: 'problems.p21.description',
    hintKey: 'problems.p21.hint',
    initialCode: 'def get_value(d, key):\n  # Your code here\n  pass',
  },
  {
    id: 'p22',
    title: 'Merge Lists',
    description: 'Write a function `merge_lists(list1, list2)` that merges two lists into one.',
    titleKey: 'problems.p22.title',
    descriptionKey: 'problems.p22.description',
    hintKey: 'problems.p22.hint',
    initialCode: 'def merge_lists(list1, list2):\n  # Your code here\n  pass',
  },
  {
    id: 'p23',
    title: 'Remove Duplicates',
    description: 'Write a function `remove_duplicates(lst)` that removes duplicate elements from a list and returns a new list.',
    titleKey: 'problems.p23.title',
    descriptionKey: 'problems.p23.description',
    hintKey: 'problems.p23.hint',
    initialCode: 'def remove_duplicates(lst):\n  # Your code here\n  pass',
  },
  {
    id: 'p24',
    title: 'Check if Key Exists',
    description: 'Write a function `key_exists(d, key)` that returns `True` if a key exists in a dictionary `d`.',
    titleKey: 'problems.p24.title',
    descriptionKey: 'problems.p24.description',
    hintKey: 'problems.p24.hint',
    initialCode: 'def key_exists(d, key):\n  # Your code here\n  pass',
  },
  {
    id: 'p25',
    title: 'Power of a Number',
    description: 'Write a function `power(base, exp)` that calculates `base` to the power of `exp`.',
    titleKey: 'problems.p25.title',
    descriptionKey: 'problems.p25.description',
    hintKey: 'problems.p25.hint',
    initialCode: 'def power(base, exp):\n  # Your code here\n  pass',
  },
  {
    id: 'p26',
    title: 'Generate Numbers',
    description: 'Write a function `generate_numbers(n)` that returns a list of integers from 1 to `n`.',
    titleKey: 'problems.p26.title',
    descriptionKey: 'problems.p26.description',
    hintKey: 'problems.p26.hint',
    initialCode: 'def generate_numbers(n):\n  # Your code here\n  pass',
  },
  {
    id: 'p27',
    title: 'Find Minimum in List',
    description: 'Write a function `find_min(numbers)` that finds the minimum value in a list of numbers.',
    titleKey: 'problems.p27.title',
    descriptionKey: 'problems.p27.description',
    hintKey: 'problems.p27.hint',
    initialCode: 'def find_min(numbers):\n  # Your code here\n  pass',
  },
  {
    id: 'p28',
    title: 'Absolute Value',
    description: 'Write a function `absolute_value(num)` that returns the absolute value of a number.',
    titleKey: 'problems.p28.title',
    descriptionKey: 'problems.p28.description',
    hintKey: 'problems.p28.hint',
    initialCode: 'def absolute_value(num):\n  # Your code here\n  pass',
  },
  {
    id: 'p29',
    title: 'Count Words in String',
    description: 'Write a function `count_words(s)` that returns the number of words in a string `s`. Words are separated by spaces.',
    titleKey: 'problems.p29.title',
    descriptionKey: 'problems.p29.description',
    hintKey: 'problems.p29.hint',
    initialCode: 'def count_words(s):\n  # Your code here\n  pass',
  },
  {
    id: 'p30',
    title: 'Create a Dictionary',
    description: 'Write a function `create_dictionary(keys, values)` that creates a dictionary from two lists.',
    titleKey: 'problems.p30.title',
    descriptionKey: 'problems.p30.description',
    hintKey: 'problems.p30.hint',
    initialCode: 'def create_dictionary(keys, values):\n  # Your code here\n  pass',
  },
  {
    id: 'p31',
    title: 'List to String',
    description: 'Write a function `list_to_string(char_list, separator)` that joins a list of characters with a separator.',
    titleKey: 'problems.p31.title',
    descriptionKey: 'problems.p31.description',
    hintKey: 'problems.p31.hint',
    initialCode: 'def list_to_string(char_list, separator):\n  # Your code here\n  pass',
  },
  {
    id: 'p32',
    title: 'Is Positive',
    description: 'Write a function `is_positive(num)` that returns `True` if a number is greater than 0.',
    titleKey: 'problems.p32.title',
    descriptionKey: 'problems.p32.description',
    hintKey: 'problems.p32.hint',
    initialCode: 'def is_positive(num):\n  # Your code here\n  pass',
  },
];


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const users: User[] = useMemo(() => {
    const teacher: User = { id: 'teacher-admin', name: 'Teacher', username: 'teacher', password: 'admin', role: 'teacher' };
    const studentUsers: User[] = students.map(student => {
        const classroom = classrooms.find(c => c.studentIds.includes(student.id));
        return {
            id: student.id,
            name: student.name,
            username: student.username,
            password: student.password,
            role: 'student',
            classId: classroom?.id,
            studentNumber: student.studentNumber,
        };
    });
    return [teacher, ...studentUsers];
  }, [students, classrooms]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (username: string, password?: string): boolean => {
    const userToLogin = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (userToLogin && userToLogin.password === password) {
      // Create a new object for currentUser without the password
      const { password: _, ...userWithoutPassword } = userToLogin;
      setCurrentUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addProblem = (problem: Omit<Problem, 'id'>) => {
    const newProblem: Problem = { ...problem, id: `p${Date.now()}` };
    setProblems(prev => [...prev, newProblem]);
  };

  const updateProblem = (problemId: string, updatedData: Partial<Omit<Problem, 'id'>>) => {
    setProblems(prev =>
      prev.map(p =>
        p.id === problemId ? { ...p, ...updatedData } : p
      )
    );
  };

  const addSubmission = (submission: Omit<Submission, 'id' | 'submittedAt'>) => {
// FIX: Corrected typo `new new Date()` to `new Date()`
    const newSubmission: Submission = { ...submission, id: `s${Date.now()}`, submittedAt: new Date() };
    setSubmissions(prev => [...prev, newSubmission]);
  };

  const addClassroom = (name: string) => {
    const newClassroom: Classroom = { name, id: `c${Date.now()}`, studentIds: [] };
    setClassrooms(prev => [...prev, newClassroom]);
  };
  
  const addStudentToClassroom = (studentData: NewStudentData, classroomId: string): string | null => {
    if (users.some(u => u.username.toLowerCase() === studentData.username.toLowerCase())) {
        return `Username "${studentData.username}" already exists.`;
    }
     if (studentData.studentNumber && users.some(u => u.studentNumber === studentData.studentNumber)) {
        return `Student number "${studentData.studentNumber}" already exists.`;
    }
    
    const newStudent: Student = { ...studentData, id: `s${Date.now()}`};
    setStudents(prev => [...prev, newStudent]);
    setClassrooms(prev => prev.map(c => 
        c.id === classroomId 
        ? { ...c, studentIds: [...c.studentIds, newStudent.id] } 
        : c
    ));
    return null; // success
  };

  const addStudentsToClassroom = (studentDataList: NewStudentData[], classroomId: string): string | null => {
    const existingUsernames = new Set(users.map(u => u.username.toLowerCase()));
    const existingStudentNumbers = new Set(users.map(u => u.studentNumber).filter(Boolean));
    
    for (const studentData of studentDataList) {
        if (existingUsernames.has(studentData.username.toLowerCase())) {
            return `Username "${studentData.username}" already exists. Batch registration cancelled.`;
        }
        if (studentData.studentNumber && existingStudentNumbers.has(studentData.studentNumber)) {
            return `Student number "${studentData.studentNumber}" already exists. Batch registration cancelled.`;
        }
    }

    const newStudents: Student[] = studentDataList.map(data => ({
      ...data,
      id: `s${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }));

    const newStudentIds = newStudents.map(s => s.id);

    setStudents(prev => [...prev, ...newStudents]);
    
    setClassrooms(prev => prev.map(c => 
        c.id === classroomId 
        ? { ...c, studentIds: [...c.studentIds, ...newStudentIds] } 
        : c
    ));
    return null; // success
  };
  
  const updateStudent = (studentId: string, updatedData: Partial<Omit<Student, 'id'>>): string | null => {
      if (updatedData.username) {
          const usernameExists = users.some(u => 
              u.username.toLowerCase() === updatedData.username!.toLowerCase() && u.id !== studentId
          );
          if (usernameExists) {
              return `Username "${updatedData.username}" is already taken.`;
          }
      }
      
      if (updatedData.studentNumber) {
        const studentNumberExists = users.some(u => 
            u.studentNumber === updatedData.studentNumber && u.id !== studentId
        );
        if (studentNumberExists) {
            return `Student number "${updatedData.studentNumber}" is already taken.`;
        }
      }

      setStudents(prev => prev.map(student => {
          if (student.id === studentId) {
              const newStudentData = { ...student, ...updatedData };
              // Don't update password if it's an empty string
              if (updatedData.password === '') {
                  delete newStudentData.password;
              }
              return newStudentData;
          }
          return student;
      }));

      return null; // success
  };

  const addMaterial = (name: string, description: string, file: File) => {
    const newMaterial: TeachingMaterial = {
      id: `m${Date.now()}`,
      name,
      description,
      file,
      fileURL: URL.createObjectURL(file),
      uploadedAt: new Date(),
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const deleteMaterial = (materialId: string) => {
    setMaterials(prev => {
      const materialToDelete = prev.find(m => m.id === materialId);
      if (materialToDelete) {
        URL.revokeObjectURL(materialToDelete.fileURL);
      }
      return prev.filter(m => m.id !== materialId);
    });
  };

  // Cleanup object URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      materials.forEach(material => URL.revokeObjectURL(material.fileURL));
    };
  }, [materials]);


  return (
    <AppContext.Provider value={{ problems, submissions, classrooms, students, materials, users, currentUser, addProblem, updateProblem, addSubmission, addClassroom, addStudentToClassroom, addStudentsToClassroom, updateStudent, addMaterial, deleteMaterial, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};