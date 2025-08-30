import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

type Locale = 'en' | 'ko';

// Define the structure for translations
const translations = {
  en: {
    header: {
        title: "Python study for yeonggwang- high school",
        welcome: "Welcome",
        logout: "Logout",
        login: "Login",
    },
    login: {
        title: "Login",
        subtitle: "Welcome to the Python Coder Analytics Platform.",
        usernamePlaceholder: "Username",
        passwordPlaceholder: "Password",
        loginButton: "Login",
        errorBothFields: "Please enter both username and password.",
        errorInvalid: "Invalid username or password.",
    },
    teacherDashboard: {
        title: "Teacher Dashboard",
        myMaterials: "My Materials",
        manageClasses: "Manage Classes",
        createProblem: "Create New Problem",
        noProblems: "No problems created yet. Click 'Create New Problem' to get started!",
        noClassroomsMessage: "No classrooms created yet. Go to 'Manage Classes' to create one.",
        classLabel: "Class:",
        selectClassLabel: "Filter by Class:",
        allClassesOption: "All Classes",
    },
    createProblemModal: {
        title: "Create New Problem",
        problemTitle: "Problem Title",
        description: "Description (Supports Markdown)",
        initialCode: "Initial Code (Optional)",
        cancel: "Cancel",
        create: "Create",
    },
    editProblemModal: {
        title: "Edit Problem",
        save: "Save Changes",
    },
    problemSubmissions: {
        submittedAt: "Submitted at",
        viewDetails: "View Details",
        noSubmissions: "No submissions yet for this problem.",
        viewProblem: "View Problem",
        solveProblem: "Solve Problem",
        submitDisabledTooltip: "Submission is disabled for teachers.",
        edit: "Edit",
    },
    classManagement: {
        back: "Back",
        title: "Class Management",
        newClassName: "New Class Name...",
        addClass: "Add Class",
        students: "Students",
        edit: "Edit",
        noStudents: "No students in this class yet.",
        newStudentName: "Student Name",
        username: "Username",
        password: "Password",
        studentNumber: "Student Number",
        addStudent: "Add Student",
        or: "OR",
        bulkAdd: "Bulk Add Students via XLSX",
        addStudentAlert: "Please fill in name, username, and password for the new student.",
        bulkAddSuccess: "{count} students added successfully to the class.",
        bulkAddNoData: "No valid student data found. Please ensure the file has columns \"name\", \"username\", \"password\", and optionally \"studentNumber\" with data in each row.",
        bulkAddFileError: "There was an error processing the file. Please check the file format and try again."
    },
    editStudentModal: {
        title: "Edit Student",
        name: "Name",
        username: "Username",
        studentNumber: "Student Number",
        newPassword: "New Password",
        newPasswordPlaceholder: "Leave blank to keep current password",
        errorEmpty: "Name and username cannot be empty.",
        cancel: "Cancel",
        save: "Save Changes",
    },
    materials: {
        back: "Back",
        title: "My Materials",
        uploadNew: "Upload New Material",
        fileName: "File Name",
        description: "Description",
        dateUploaded: "Date Uploaded",
        actions: "Actions",
        delete: "Delete",
        noMaterials: "No materials uploaded yet.",
    },
    uploadMaterialModal: {
        title: "Upload New Material",
        name: "Material Name / Title",
        description: "Description (Optional)",
        file: "File",
        uploadPrompt: "Click to upload",
        dragDrop: "or drag and drop",
        errorName: "Material name is required.",
        errorFile: "Please select a file to upload.",
        cancel: "Cancel",
        upload: "Upload",
    },
    studentDashboard: {
        title: "Student Dashboard",
        welcome: "Welcome,",
        from: "from",
        solveProblem: "Solve Problem",
    },
    codingPage: {
        pyodideLoading: "Python environment is loading...",
        pyodideLoaded: "Python environment loaded successfully. You can now run your code.",
        pyodideError: "Failed to load the Python environment. Code execution will not work.",
        runMessage: "Running code...",
        errorMessage: "Error:",
        successMessage: "Code executed successfully with no output.",
        executionError: "Execution Error:",
        submissionSuccess: "Your solution has been submitted successfully!",
        problemNotFound: "Problem not found.",
        backToDashboard: "Back to Dashboard",
        problemDescription: "Problem Description",
        yourCode: "Your Code",
        initialCode: "Initial Code",
        noInitialCode: "No initial code provided for this problem.",
        runCode: "Run Code",
        submitFinalCode: "Submit Final Code",
        output: "Output",
        aiFeedback: "AI Feedback",
        aiExplanation: "AI Explanation",
        getAIFeedback: "Run your code first to get feedback on the latest version.",
        getAIExplanation: "Run your code first to get an explanation of the latest version."
    },
    submissionDetail: {
        backToDashboard: "Back to Dashboard",
        title: "Submission Details",
        student: "Student",
        class: "Class",
        problem: "Problem",
        submittedAt: "Submitted At",
        finalCode: "Final Code Submitted",
    },
    codeFeedback: {
        title: "AI Code Feedback",
        noCode: "No code submitted for feedback.",
        analyzing: "Analyzing code...",
        error: "Failed to fetch feedback.",
    },
    codeExplanation: {
        title: "AI Code Explanation",
        noCode: "No code provided for explanation.",
        generating: "Generating explanation...",
        error: "Failed to fetch explanation.",
    },
    typingGraph: {
        title: "Typing Cadence Analysis",
        timeLabel: "Time (seconds)",
        charLabel: "Characters Typed",
        legend: "Code Length",
    },
    problems: {
      p1: {
        title: "Hello, World!",
        description: "Write a Python function `greet()` that returns the string \"Hello, World!\".",
        hint: "Your function should simply use the `return` keyword followed by the required string."
      },
      p2: {
        title: "Sum of Two Numbers",
        description: "Write a Python function `sum_two(a, b)` that takes two numbers `a` and `b` as input and returns their sum.",
        hint: "Use the `+` operator to add the two parameters `a` and `b` together."
      },
      p3: {
        title: "Subtract Two Numbers",
        description: "Write a Python function `subtract(a, b)` that takes two numbers `a` and `b` and returns their difference (a - b).",
        hint: "Use the `-` operator for subtraction."
      },
      p4: {
        title: "Multiply Two Numbers",
        description: "Write a Python function `multiply(a, b)` that returns the product of two numbers `a` and `b`.",
        hint: "The multiplication operator in Python is `*`."
      },
      p5: {
        title: "Check for Even Number",
        description: "Write a function `is_even(number)` that returns `True` if the number is even, and `False` otherwise.",
        hint: "An even number is a number that is perfectly divisible by 2. The modulo operator `%` can help you check for a remainder."
      },
      p6: {
        title: "Find Maximum of Two",
        description: "Write a function `max_of_two(a, b)` that returns the larger of the two numbers.",
        hint: "You can use an `if-else` statement to compare `a` and `b`. Alternatively, Python has a built-in `max()` function."
      },
      p7: {
        title: "String Length",
        description: "Write a function `get_string_length(s)` that returns the length of a given string `s`.",
        hint: "Python's built-in `len()` function can be used to find the length of a string."
      },
      p8: {
        title: "Reverse a String",
        description: "Write a function `reverse_string(s)` that takes a string `s` and returns the reversed string.",
        hint: "You can use slicing to reverse a string. The slice `[::-1]` reverses any sequence."
      },
      p9: {
        title: "First Element of a List",
        description: "Write a function `get_first_element(lst)` that returns the first element of a list `lst`.",
        hint: "List elements are accessed by their index. The first element is at index `0`."
      },
      p10: {
        title: "Sum of List Elements",
        description: "Write a function `sum_list(numbers)` that returns the sum of all numbers in a list.",
        hint: "Python has a built-in `sum()` function that works on lists of numbers."
      },
      p11: {
        title: "Celsius to Fahrenheit",
        description: "Write a function `celsius_to_fahrenheit(celsius)` that converts Celsius to Fahrenheit. Formula: (C * 9/5) + 32.",
        hint: "Make sure to follow the order of operations. Multiplication and division happen before addition."
      },
      p12: {
        title: "Count Vowels",
        description: "Write a function `count_vowels(s)` that counts the number of vowels (a, e, i, o, u) in a string.",
        hint: "Iterate through the string and check if each character is in the set of vowels. Remember to handle both uppercase and lowercase vowels."
      },
      p13: {
        title: "Palindrome Check",
        description: "Write a function `is_palindrome(s)` that checks if a string is a palindrome (reads the same forwards and backwards).",
        hint: "A simple way is to compare the string with its reverse. You can get the reverse using slicing `[::-1]`."
      },
      p14: {
        title: "Factorial",
        description: "Write a function `factorial(n)` that computes the factorial of a non-negative integer `n`.",
        hint: "Factorial of n (n!) is the product of all positive integers up to n. A loop or recursion can be used. Remember the base case: factorial of 0 is 1."
      },
      p15: {
        title: "Find in List",
        description: "Write a function `find_element(lst, element)` that returns `True` if the element is in the list, `False` otherwise.",
        hint: "Use the `in` keyword to check for membership in a list."
      },
      p16: {
        title: "Average of List",
        description: "Write a function `calculate_average(numbers)` that returns the average of a list of numbers.",
        hint: "The average is the sum of the elements divided by the count of the elements. Use `sum()` and `len()`."
      },
      p17: {
        title: "String to Uppercase",
        description: "Write a function `to_uppercase(s)` that converts a string to uppercase.",
        hint: "Strings have a built-in method `.upper()`."
      },
      p18: {
        title: "Area of Circle",
        description: "Write a function `circle_area(radius)` that calculates the area of a circle. Use `3.14159` for pi.",
        hint: "The formula for the area of a circle is π * r^2. You can calculate the square of the radius using `radius * radius` or `radius ** 2`."
      },
      p19: {
        title: "Check for Substring",
        description: "Write a function `contains_substring(main_str, sub_str)` that returns `True` if `main_str` contains `sub_str`.",
        hint: "Just like with lists, you can use the `in` keyword to check if a string contains another string."
      },
      p20: {
        title: "FizzBuzz",
        description: "Write a function `fizzbuzz(n)` that returns \"Fizz\" if n is divisible by 3, \"Buzz\" if by 5, \"FizzBuzz\" if by both, and the number itself otherwise.",
        hint: "Use the modulo operator (`%`) to check for divisibility. Be careful with the order of your `if`/`elif`/`else` checks; check for divisibility by both 3 and 5 first."
      },
      p21: {
        title: "Get Dictionary Value",
        description: "Write a function `get_value(d, key)` that returns the value for a given key in a dictionary `d`.",
        hint: "You can access a dictionary value using square brackets, like `d[key]`."
      },
      p22: {
        title: "Merge Lists",
        description: "Write a function `merge_lists(list1, list2)` that merges two lists into one.",
        hint: "The `+` operator can be used to concatenate two lists."
      },
      p23: {
        title: "Remove Duplicates",
        description: "Write a function `remove_duplicates(lst)` that removes duplicate elements from a list and returns a new list.",
        hint: "A common trick is to convert the list to a `set` to automatically remove duplicates, and then convert it back to a `list`."
      },
      p24: {
        title: "Check if Key Exists",
        description: "Write a function `key_exists(d, key)` that returns `True` if a key exists in a dictionary `d`.",
        hint: "The `in` keyword can be used to check if a key exists in a dictionary."
      },
      p25: {
        title: "Power of a Number",
        description: "Write a function `power(base, exp)` that calculates `base` to the power of `exp`.",
        hint: "The exponentiation operator in Python is `**`."
      },
      p26: {
        title: "Generate Numbers",
        description: "Write a function `generate_numbers(n)` that returns a list of integers from 1 to `n`.",
        hint: "The `range()` function is useful here. Remember to convert the range object to a list using `list()`."
      },
      p27: {
        title: "Find Minimum in List",
        description: "Write a function `find_min(numbers)` that finds the minimum value in a list of numbers.",
        hint: "Python has a built-in `min()` function for this."
      },
      p28: {
        title: "Absolute Value",
        description: "Write a function `absolute_value(num)` that returns the absolute value of a number.",
        hint: "The built-in `abs()` function will do this for you."
      },
      p29: {
        title: "Count Words in String",
        description: "Write a function `count_words(s)` that returns the number of words in a string `s`. Words are separated by spaces.",
        hint: "Use the string's `.split()` method to create a list of words, then find the length of that list."
      },
      p30: {
        title: "Create a Dictionary",
        description: "Write a function `create_dictionary(keys, values)` that creates a dictionary from two lists.",
        hint: "The `zip()` function is perfect for combining two lists into pairs, which can then be passed to the `dict()` constructor."
      },
      p31: {
        title: "List to String",
        description: "Write a function `list_to_string(char_list, separator)` that joins a list of characters with a separator.",
        hint: "Use the `separator.join(char_list)` string method."
      },
      p32: {
        title: "Is Positive",
        description: "Write a function `is_positive(num)` that returns `True` if a number is greater than 0.",
        hint: "Use the `>` comparison operator."
      }
    }
  },
  ko: {
    header: {
        title: "영광고등학교 파이썬 스터디",
        welcome: "님, 환영합니다",
        logout: "로그아웃",
        login: "로그인",
    },
    login: {
        title: "로그인",
        subtitle: "Python 코더 분석 플랫폼에 오신 것을 환영합니다.",
        usernamePlaceholder: "사용자 이름",
        passwordPlaceholder: "비밀번호",
        loginButton: "로그인",
        errorBothFields: "사용자 이름과 비밀번호를 모두 입력해주세요.",
        errorInvalid: "잘못된 사용자 이름 또는 비밀번호입니다.",
    },
    teacherDashboard: {
        title: "교사 대시보드",
        myMaterials: "내 자료",
        manageClasses: "학급 관리",
        createProblem: "새 문제 만들기",
        noProblems: "아직 생성된 문제가 없습니다. '새 문제 만들기'를 클릭하여 시작하세요!",
        noClassroomsMessage: "아직 생성된 학급이 없습니다. '학급 관리'로 이동하여 학급을 생성하세요.",
        classLabel: "학급:",
        selectClassLabel: "학급별로 보기:",
        allClassesOption: "모든 학급",
    },
    createProblemModal: {
        title: "새 문제 만들기",
        problemTitle: "문제 제목",
        description: "설명 (마크다운 지원)",
        initialCode: "초기 코드 (선택 사항)",
        cancel: "취소",
        create: "만들기",
    },
    editProblemModal: {
        title: "문제 수정",
        save: "변경 사항 저장",
    },
    problemSubmissions: {
        submittedAt: "제출 시간:",
        viewDetails: "상세 보기",
        noSubmissions: "이 문제에 대한 제출물이 아직 없습니다.",
        viewProblem: "문제 보기",
        solveProblem: "문제 풀기",
        submitDisabledTooltip: "교사는 코드를 제출할 수 없습니다.",
        edit: "수정",
    },
    classManagement: {
        back: "뒤로",
        title: "학급 관리",
        newClassName: "새 학급 이름...",
        addClass: "학급 추가",
        students: "학생",
        edit: "수정",
        noStudents: "이 학급에 아직 학생이 없습니다.",
        newStudentName: "학생 이름",
        username: "사용자 이름",
        password: "비밀번호",
        studentNumber: "학번",
        addStudent: "학생 추가",
        or: "또는",
        bulkAdd: "XLSX로 학생 일괄 추가",
        addStudentAlert: "새 학생의 이름, 사용자 이름, 비밀번호를 모두 입력해주세요.",
        bulkAddSuccess: "{count}명의 학생이 학급에 성공적으로 추가되었습니다.",
        bulkAddNoData: "유효한 학생 데이터를 찾을 수 없습니다. 파일에 \"name\", \"username\", \"password\" 열과 선택적으로 \"studentNumber\" 열이 있고 각 행에 데이터가 있는지 확인해주세요.",
        bulkAddFileError: "파일 처리 중 오류가 발생했습니다. 파일 형식을 확인하고 다시 시도해주세요."
    },
    editStudentModal: {
        title: "학생 정보 수정",
        name: "이름",
        username: "사용자 이름",
        studentNumber: "학번",
        newPassword: "새 비밀번호",
        newPasswordPlaceholder: "현재 비밀번호를 유지하려면 비워두세요",
        errorEmpty: "이름과 사용자 이름은 비워둘 수 없습니다.",
        cancel: "취소",
        save: "변경 사항 저장",
    },
    materials: {
        back: "뒤로",
        title: "내 자료",
        uploadNew: "새 자료 업로드",
        fileName: "파일 이름",
        description: "설명",
        dateUploaded: "업로드 날짜",
        actions: "작업",
        delete: "삭제",
        noMaterials: "아직 업로드된 자료가 없습니다.",
    },
    uploadMaterialModal: {
        title: "새 자료 업로드",
        name: "자료 이름 / 제목",
        description: "설명 (선택 사항)",
        file: "파일",
        uploadPrompt: "클릭하여 업로드",
        dragDrop: "또는 드래그 앤 드롭",
        errorName: "자료 이름은 필수입니다.",
        errorFile: "업로드할 파일을 선택해주세요.",
        cancel: "취소",
        upload: "업로드",
    },
    studentDashboard: {
        title: "학생 대시보드",
        welcome: "님, 환영합니다!",
        from: "의",
        solveProblem: "문제 풀기",
    },
    codingPage: {
        pyodideLoading: "Python 환경을 로딩 중입니다...",
        pyodideLoaded: "Python 환경이 성공적으로 로드되었습니다. 이제 코드를 실행할 수 있습니다.",
        pyodideError: "Python 환경을 로드하는 데 실패했습니다. 코드 실행이 작동하지 않습니다.",
        runMessage: "코드를 실행 중입니다...",
        errorMessage: "오류:",
        successMessage: "코드가 성공적으로 실행되었으며 출력은 없습니다.",
        executionError: "실행 오류:",
        submissionSuccess: "솔루션이 성공적으로 제출되었습니다!",
        problemNotFound: "문제를 찾을 수 없습니다.",
        backToDashboard: "대시보드로 돌아가기",
        problemDescription: "문제 설명",
        yourCode: "내 코드",
        initialCode: "초기 코드",
        noInitialCode: "이 문제에는 초기 코드가 제공되지 않았습니다.",
        runCode: "코드 실행",
        submitFinalCode: "최종 코드 제출",
        output: "출력",
        aiFeedback: "AI 피드백",
        aiExplanation: "AI 코드 설명",
        getAIFeedback: "최신 버전에 대한 피드백을 받으려면 먼저 코드를 실행하세요.",
        getAIExplanation: "최신 버전에 대한 설명을 보려면 먼저 코드를 실행하세요."
    },
    submissionDetail: {
        backToDashboard: "대시보드로 돌아가기",
        title: "제출 상세 정보",
        student: "학생",
        class: "학급",
        problem: "문제",
        submittedAt: "제출 시간",
        finalCode: "제출된 최종 코드",
    },
    codeFeedback: {
        title: "AI 코드 피드백",
        noCode: "피드백을 위해 제출된 코드가 없습니다.",
        analyzing: "코드를 분석 중입니다...",
        error: "피드백을 가져오지 못했습니다.",
    },
    codeExplanation: {
        title: "AI 코드 설명",
        noCode: "설명을 위해 제공된 코드가 없습니다.",
        generating: "설명을 생성 중입니다...",
        error: "설명을 가져오지 못했습니다.",
    },
    typingGraph: {
        title: "타이핑 속도 분석",
        timeLabel: "시간 (초)",
        charLabel: "타이핑된 문자 수",
        legend: "코드 길이",
    },
    problems: {
      p1: {
        title: "Hello, World!",
        description: "\"Hello, World!\" 문자열을 반환하는 `greet()` 파이썬 함수를 작성하세요.",
        hint: "함수에서 `return` 키워드와 필요한 문자열을 사용하기만 하면 됩니다."
      },
      p2: {
        title: "두 수의 합",
        description: "두 숫자 `a`와 `b`를 입력으로 받아 그 합을 반환하는 `sum_two(a, b)` 파이썬 함수를 작성하세요.",
        hint: "`+` 연산자를 사용하여 두 매개변수 `a`와 `b`를 더하세요."
      },
      p3: {
        title: "두 수의 차",
        description: "두 숫자 `a`와 `b`를 입력받아 그 차(a - b)를 반환하는 `subtract(a, b)` 파이썬 함수를 작성하세요.",
        hint: "뺄셈에는 `-` 연산자를 사용하세요."
      },
      p4: {
        title: "두 수의 곱",
        description: "두 숫자 `a`와 `b`의 곱을 반환하는 `multiply(a, b)` 파이썬 함수를 작성하세요.",
        hint: "Python에서 곱셈 연산자는 `*`입니다."
      },
      p5: {
        title: "짝수 확인",
        description: "숫자가 짝수이면 `True`를, 그렇지 않으면 `False`를 반환하는 `is_even(number)` 함수를 작성하세요.",
        hint: "짝수는 2로 완벽하게 나누어 떨어지는 숫자입니다. 나머지 연산자 `%`를 사용하면 나머지를 확인할 수 있습니다."
      },
      p6: {
        title: "두 수 중 최댓값 찾기",
        description: "두 숫자 중 더 큰 수를 반환하는 `max_of_two(a, b)` 함수를 작성하세요.",
        hint: "`if-else` 문을 사용하여 `a`와 `b`를 비교할 수 있습니다. 또는 Python의 내장 함수 `max()`를 사용할 수도 있습니다."
      },
      p7: {
        title: "문자열 길이",
        description: "주어진 문자열 `s`의 길이를 반환하는 `get_string_length(s)` 함수를 작성하세요.",
        hint: "Python의 내장 함수 `len()`을 사용하여 문자열의 길이를 찾을 수 있습니다."
      },
      p8: {
        title: "문자열 뒤집기",
        description: "문자열 `s`를 받아 뒤집힌 문자열을 반환하는 `reverse_string(s)` 함수를 작성하세요.",
        hint: "슬라이싱을 사용하여 문자열을 뒤집을 수 있습니다. `[::-1]` 슬라이스는 모든 시퀀스를 뒤집습니다."
      },
      p9: {
        title: "리스트의 첫 번째 요소",
        description: "리스트 `lst`의 첫 번째 요소를 반환하는 `get_first_element(lst)` 함수를 작성하세요.",
        hint: "리스트 요소는 인덱스로 접근합니다. 첫 번째 요소는 인덱스 `0`에 있습니다."
      },
      p10: {
        title: "리스트 요소의 합",
        description: "숫자 리스트의 모든 요소의 합을 반환하는 `sum_list(numbers)` 함수를 작성하세요.",
        hint: "Python에는 숫자 리스트에 사용할 수 있는 내장 함수 `sum()`이 있습니다."
      },
      p11: {
        title: "섭씨를 화씨로 변환",
        description: "섭씨 온도를 화씨 온도로 변환하는 `celsius_to_fahrenheit(celsius)` 함수를 작성하세요. 공식: (C * 9/5) + 32.",
        hint: "연산 순서를 따르세요. 곱셈과 나눗셈이 덧셈보다 먼저 수행됩니다."
      },
      p12: {
        title: "모음 개수 세기",
        description: "문자열에서 모음(a, e, i, o, u)의 개수를 세는 `count_vowels(s)` 함수를 작성하세요.",
        hint: "문자열을 반복하면서 각 문자가 모음 집합에 있는지 확인하세요. 대소문자 모음을 모두 처리하는 것을 잊지 마세요."
      },
      p13: {
        title: "회문 확인",
        description: "문자열이 회문(앞으로 읽으나 뒤로 읽으나 동일한 문자열)인지 확인하는 `is_palindrome(s)` 함수를 작성하세요.",
        hint: "간단한 방법은 문자열을 뒤집은 것과 비교하는 것입니다. `[::-1]` 슬라이싱을 사용하여 문자열을 뒤집을 수 있습니다."
      },
      p14: {
        title: "팩토리얼",
        description: "음이 아닌 정수 `n`의 팩토리얼을 계산하는 `factorial(n)` 함수를 작성하세요.",
        hint: "n의 팩토리얼(n!)은 n까지의 모든 양의 정수의 곱입니다. 반복문이나 재귀를 사용할 수 있습니다. 기본 경우(base case)를 기억하세요: 0의 팩토리얼은 1입니다."
      },
      p15: {
        title: "리스트에서 찾기",
        description: "리스트에 특정 요소가 있으면 `True`를, 없으면 `False`를 반환하는 `find_element(lst, element)` 함수를 작성하세요.",
        hint: "`in` 키워드를 사용하여 리스트에 멤버가 있는지 확인할 수 있습니다."
      },
      p16: {
        title: "리스트의 평균",
        description: "숫자 리스트의 평균을 계산하는 `calculate_average(numbers)` 함수를 작성하세요.",
        hint: "평균은 요소의 합을 요소의 개수로 나눈 값입니다. `sum()`과 `len()`을 사용하세요."
      },
      p17: {
        title: "문자열을 대문자로",
        description: "문자열을 대문자로 변환하는 `to_uppercase(s)` 함수를 작성하세요.",
        hint: "문자열에는 `.upper()`라는 내장 메소드가 있습니다."
      },
      p18: {
        title: "원의 넓이",
        description: "원의 넓이를 계산하는 `circle_area(radius)` 함수를 작성하세요. 원주율(pi)은 `3.14159`를 사용하세요.",
        hint: "원의 넓이 공식은 π * r^2입니다. `radius * radius` 또는 `radius ** 2`를 사용하여 반지름의 제곱을 계산할 수 있습니다."
      },
      p19: {
        title: "부분 문자열 확인",
        description: "`main_str`에 `sub_str`이 포함되어 있으면 `True`를 반환하는 `contains_substring(main_str, sub_str)` 함수를 작성하세요.",
        hint: "리스트와 마찬가지로 `in` 키워드를 사용하여 문자열에 다른 문자열이 포함되어 있는지 확인할 수 있습니다."
      },
      p20: {
        title: "피즈버즈",
        description: "숫자 n이 3으로 나누어 떨어지면 \"Fizz\", 5로 나누어 떨어지면 \"Buzz\", 둘 다로 나누어 떨어지면 \"FizzBuzz\", 그렇지 않으면 숫자 자체를 반환하는 `fizzbuzz(n)` 함수를 작성하세요.",
        hint: "나머지 연산자(`%`)를 사용하여 나누어 떨어지는지 확인하세요. `if`/`elif`/`else` 확인 순서에 주의하세요. 3과 5 둘 다로 나누어 떨어지는 경우를 먼저 확인해야 합니다."
      },
      p21: {
        title: "딕셔너리 값 가져오기",
        description: "딕셔너리 `d`에서 주어진 키에 대한 값을 반환하는 `get_value(d, key)` 함수를 작성하세요.",
        hint: "`d[key]`와 같이 대괄호를 사용하여 딕셔너리 값에 접근할 수 있습니다."
      },
      p22: {
        title: "리스트 합치기",
        description: "두 개의 리스트를 하나로 합치는 `merge_lists(list1, list2)` 함수를 작성하세요.",
        hint: "`+` 연산자를 사용하여 두 리스트를 연결할 수 있습니다."
      },
      p23: {
        title: "중복 제거",
        description: "리스트에서 중복된 요소를 제거하고 새 리스트를 반환하는 `remove_duplicates(lst)` 함수를 작성하세요.",
        hint: "일반적인 방법은 리스트를 `set`으로 변환하여 중복을 자동으로 제거한 다음 다시 `list`로 변환하는 것입니다."
      },
      p24: {
        title: "키 존재 확인",
        description: "딕셔너리 `d`에 특정 키가 존재하는지 확인하는 `key_exists(d, key)` 함수를 작성하세요.",
        hint: "`in` 키워드를 사용하여 딕셔너리에 키가 있는지 확인할 수 있습니다."
      },
      p25: {
        title: "거듭제곱",
        description: "`base`의 `exp` 거듭제곱을 계산하는 `power(base, exp)` 함수를 작성하세요.",
        hint: "Python의 거듭제곱 연산자는 `**`입니다."
      },
      p26: {
        title: "숫자 생성",
        description: "1부터 `n`까지의 정수 리스트를 반환하는 `generate_numbers(n)` 함수를 작성하세요.",
        hint: "`range()` 함수가 유용합니다. `list()`를 사용하여 range 객체를 리스트로 변환하는 것을 잊지 마세요."
      },
      p27: {
        title: "리스트에서 최솟값 찾기",
        description: "숫자 리스트에서 최솟값을 찾는 `find_min(numbers)` 함수를 작성하세요.",
        hint: "Python에는 이를 위한 내장 함수 `min()`이 있습니다."
      },
      p28: {
        title: "절대값",
        description: "숫자의 절대값을 반환하는 `absolute_value(num)` 함수를 작성하세요.",
        hint: "내장 함수 `abs()`가 이 작업을 수행합니다."
      },
      p29: {
        title: "문자열의 단어 수 세기",
        description: "문자열 `s`의 단어 수를 반환하는 `count_words(s)` 함수를 작성하세요. 단어는 공백으로 구분됩니다.",
        hint: "문자열의 `.split()` 메소드를 사용하여 단어 리스트를 만든 다음 해당 리스트의 길이를 찾으세요."
      },
      p30: {
        title: "딕셔너리 생성",
        description: "두 개의 리스트로부터 딕셔너리를 생성하는 `create_dictionary(keys, values)` 함수를 작성하세요.",
        hint: "`zip()` 함수는 두 리스트를 쌍으로 결합하는 데 완벽하며, 이를 `dict()` 생성자에 전달할 수 있습니다."
      },
      p31: {
        title: "리스트를 문자열로",
        description: "문자 리스트를 구분자로 연결하는 `list_to_string(char_list, separator)` 함수를 작성하세요.",
        hint: "`separator.join(char_list)` 문자열 메소드를 사용하세요."
      },
      p32: {
        title: "양수 확인",
        description: "숫자가 0보다 크면 `True`를 반환하는 `is_positive(num)` 함수를 작성하세요.",
        hint: "`>` 비교 연산자를 사용하세요."
      }
    }
  }
};

type Translations = typeof translations.en;

interface LocaleContextType {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const savedLocale = localStorage.getItem('locale');
    return (savedLocale === 'ko' || savedLocale === 'en') ? savedLocale : 'en';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[locale];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, changeLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};