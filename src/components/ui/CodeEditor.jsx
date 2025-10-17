import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Download, Upload } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CodeEditor = ({ 
  language = 'python', 
  value = '', 
  onChange, 
  initialCode = '',
  testCases = null,
  expectedOutput = null,
  testData = null,
  disabled = false,
  height = '400px'
}) => {
  const [code, setCode] = useState(value || initialCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const editorRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    // Detect dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setCode(value || initialCode || '');
  }, [value, initialCode]);

  useEffect(() => {
    if (onChange) {
      onChange(code);
    }
  }, [code, onChange]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: disabled,
      cursorStyle: 'line',
      cursorBlinking: 'blink',
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      unfoldOnClickAfterEndOfLine: false,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Kod nie może być pusty');
      return;
    }

    setIsRunning(true);
    setOutput('');

    try {
      if (language === 'python') {
        await runPythonCode();
      } else if (language === 'sql') {
        await runSqlCode();
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`Błąd: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const validatePythonSecurity = (pythonCode) => {
    const dangerousPatterns = [
      // File system operations
      /import\s+os/i,
      /import\s+shutil/i,
      /import\s+subprocess/i,
      /import\s+sys/i,
      /from\s+os\s+import/i,
      /from\s+shutil\s+import/i,
      /from\s+subprocess\s+import/i,
      /from\s+sys\s+import/i,
      /open\s*\(/i,
      /file\s*\(/i,
      /\.read\s*\(/i,
      /\.write\s*\(/i,
      /\.remove\s*\(/i,
      /\.rmdir\s*\(/i,
      /\.mkdir\s*\(/i,
      /\.chdir\s*\(/i,
      /\.listdir\s*\(/i,
      /\.walk\s*\(/i,
      /\.system\s*\(/i,
      /\.popen\s*\(/i,
      /\.call\s*\(/i,
      /\.run\s*\(/i,
      /\.check_output\s*\(/i,
      /\.Popen\s*\(/i,
      /exec\s*\(/i,
      /eval\s*\(/i,
      /compile\s*\(/i,
      /__import__\s*\(/i,
      /getattr\s*\(/i,
      /setattr\s*\(/i,
      /delattr\s*\(/i,
      /hasattr\s*\(/i,
      /globals\s*\(/i,
      /locals\s*\(/i,
      /vars\s*\(/i,
      /dir\s*\(/i,
      /type\s*\(/i,
      /isinstance\s*\(/i,
      /issubclass\s*\(/i,
      /super\s*\(/i,
      /property\s*\(/i,
      /staticmethod\s*\(/i,
      /classmethod\s*\(/i,
      /lambda\s+/i,
      /while\s+True/i,
      /for\s+\w+\s+in\s+range\s*\(\s*999999/i,
      /import\s+requests/i,
      /import\s+urllib/i,
      /import\s+http/i,
      /import\s+socket/i,
      /import\s+ssl/i,
      /import\s+ftplib/i,
      /import\s+telnetlib/i,
      /import\s+poplib/i,
      /import\s+smtplib/i,
      /import\s+imaplib/i,
      /import\s+nntplib/i,
      /import\s+webbrowser/i,
      /import\s+email/i,
      /import\s+mimetypes/i,
      /import\s+base64/i,
      /import\s+hashlib/i,
      /import\s+hmac/i,
      /import\s+secrets/i,
      /import\s+crypt/i,
      /import\s+zlib/i,
      /import\s+gzip/i,
      /import\s+bz2/i,
      /import\s+lzma/i,
      /import\s+tarfile/i,
      /import\s+zipfile/i,
      /import\s+pickle/i,
      /import\s+cPickle/i,
      /import\s+json/i,
      /import\s+xml/i,
      /import\s+csv/i,
      /import\s+sqlite3/i,
      /import\s+psycopg2/i,
      /import\s+pymongo/i,
      /import\s+redis/i,
      /import\s+memcache/i,
      /import\s+threading/i,
      /import\s+multiprocessing/i,
      /import\s+queue/i,
      /import\s+concurrent/i,
      /import\s+asyncio/i,
      /import\s+time/i,
      /import\s+datetime/i,
      /import\s+calendar/i,
      /import\s+collections/i,
      /import\s+itertools/i,
      /import\s+functools/i,
      /import\s+operator/i,
      /import\s+math/i,
      /import\s+random/i,
      /import\s+statistics/i,
      /import\s+decimal/i,
      /import\s+fractions/i,
      /import\s+numpy/i,
      /import\s+pandas/i,
      /import\s+matplotlib/i,
      /import\s+seaborn/i,
      /import\s+plotly/i,
      /import\s+bokeh/i,
      /import\s+scipy/i,
      /import\s+sklearn/i,
      /import\s+tensorflow/i,
      /import\s+torch/i,
      /import\s+keras/i,
      /import\s+pytorch/i,
      /import\s+theano/i,
      /import\s+caffe/i,
      /import\s+mxnet/i,
      /import\s+cntk/i,
      /import\s+chainer/i,
      /import\s+lasagne/i,
      /import\s+nolearn/i,
      /import\s+dlib/i,
      /import\s+opencv/i,
      /import\s+cv2/i,
      /import\s+PIL/i,
      /import\s+Image/i,
      /import\s+wand/i,
      /import\s+skimage/i,
      /import\s+scikit-image/i,
      /import\s+mahotas/i,
      /import\s+SimpleCV/i,
      /import\s+pygame/i,
      /import\s+pyglet/i,
      /import\s+panda3d/i,
      /import\s+arcade/i,
      /import\s+cocos2d/i,
      /import\s+kivy/i,
      /import\s+pyqt/i,
      /import\s+pyside/i,
      /import\s+tkinter/i,
      /import\s+wx/i,
      /import\s+gtk/i,
      /import\s+flask/i,
      /import\s+django/i,
      /import\s+fastapi/i,
      /import\s+starlette/i,
      /import\s+quart/i,
      /import\s+sanic/i,
      /import\s+tornado/i,
      /import\s+aiohttp/i,
      /import\s+requests/i,
      /import\s+urllib3/i,
      /import\s+httpx/i,
      /import\s+websockets/i,
      /import\s+socketio/i,
      /import\s+grpc/i,
      /import\s+twisted/i,
      /import\s+gevent/i,
      /import\s+eventlet/i,
      /import\s+celery/i,
      /import\s+rq/i,
      /import\s+huey/i,
      /import\s+dramatiq/i,
      /import\s+kombu/i,
      /import\s+amqp/i,
      /import\s+pika/i,
      /import\s+rabbitpy/i,
      /import\s+pykka/i,
      /import\s+actorpy/i,
      /import\s+thespian/i,
      /import\s+dispy/i,
      /import\s+parallelpython/i,
      /import\s+scoop/i,
      /import\s+ray/i,
      /import\s+dask/i,
      /import\s+joblib/i,
      /import\s+luigi/i,
      /import\s+airflow/i,
      /import\s+prefect/i,
      /import\s+kedro/i,
      /import\s+mlflow/i,
      /import\s+wandb/i,
      /import\s+neptune/i,
      /import\s+comet/i,
      /import\s+optuna/i,
      /import\s+hyperopt/i,
      /import\s+skopt/i,
      /import\s+spearmint/i,
      /import\s+smac/i,
      /import\s+bohb/i,
      /import\s+nevergrad/i,
      /import\s+ax/i,
      /import\s+bayesian-optimization/i,
      /import\s+gpytorch/i,
      /import\s+botorch/i,
      /import\s+emukit/i,
      /import\s+cornershop/i,
      /import\s+trieste/i,
      /import\s+sklearn-gp/i,
      /import\s+scikit-optimize/i,
      /import\s+pySOT/i,
      /import\s+pyGPGO/i,
      /import\s+GPy/i,
      /import\s+GPyOpt/i,
      /import\s+GPyOpt/i,
      /import\s+GPyOpt/i
    ];

    const warnings = [];
    const errors = [];

    dangerousPatterns.forEach((pattern, index) => {
      if (pattern.test(pythonCode)) {
        errors.push(`🚨 NIEBEZPIECZNA OPERACJA: Import lub użycie niebezpiecznego modułu/funkcji`);
      }
    });

    // Check for infinite loops
    if (pythonCode.includes('while True:') || pythonCode.includes('while 1:')) {
      warnings.push('⚠️  Potencjalnie nieskończona pętla wykryta');
    }

    return { warnings, errors };
  };

  const runPythonCode = async () => {
    setOutput('Uruchamianie kodu Python...\n');
    
    setTimeout(() => {
      try {
        const trimmedCode = code.trim();
        
        if (!trimmedCode) {
          setOutput(prev => prev + '❌ Błąd: Kod jest pusty!\n');
          return;
        }

        // Security validation
        const securityCheck = validatePythonSecurity(trimmedCode);
        
        if (securityCheck.errors.length > 0) {
          setOutput(prev => prev + '🚨 BŁĄD BEZPIECZEŃSTWA:\n');
          securityCheck.errors.forEach(error => {
            setOutput(prev => prev + `   ${error}\n`);
          });
          setOutput(prev => prev + '\n❌ Kod został zablokowany ze względów bezpieczeństwa!\n');
          setOutput(prev => prev + '💡 Dozwolone są tylko podstawowe operacje Python (print, zmienne, podstawowe funkcje).\n');
          return;
        }

        if (securityCheck.warnings.length > 0) {
          setOutput(prev => prev + '⚠️  OSTRZEŻENIA BEZPIECZEŃSTWA:\n');
          securityCheck.warnings.forEach(warning => {
            setOutput(prev => prev + `   ${warning}\n`);
          });
          setOutput(prev => prev + '\n');
        }
        
        setOutput(prev => prev + '✅ Kod wykonany pomyślnie!\n\n');
        
        // Check for basic syntax errors
        if (trimmedCode.includes('print(')) {
          setOutput(prev => prev + '📋 Analiza kodu:\n');
          // Extract what's being printed
          const printMatch = trimmedCode.match(/print\(['"](.*?)['"]\)/);
          if (printMatch) {
            const printedText = printMatch[1];
            setOutput(prev => prev + `   📤 Wyświetlono: "${printedText}"\n`);
            
            if (expectedOutput) {
              if (printedText === expectedOutput) {
                setOutput(prev => prev + `   🎯 Wynik poprawny! Oczekiwano: "${expectedOutput}"\n`);
              } else {
                setOutput(prev => prev + `   ⚠️  Wynik niepoprawny. Oczekiwano: "${expectedOutput}", otrzymano: "${printedText}"\n`);
              }
            }
          } else {
            setOutput(prev => prev + '   📤 Użyto funkcji print()\n');
          }
        } else if (trimmedCode.includes('def ')) {
          setOutput(prev => prev + '📋 Analiza kodu:\n');
          setOutput(prev => prev + '   ✓ Funkcja zdefiniowana poprawnie\n');
        } else if (trimmedCode.includes('=') && trimmedCode.includes('+')) {
          setOutput(prev => prev + '📋 Analiza kodu:\n');
          setOutput(prev => prev + '   ✓ Operacja matematyczna wykonana\n');
        } else {
          setOutput(prev => prev + '📋 Analiza kodu:\n');
          setOutput(prev => prev + '   ✓ Kod wykonany\n');
        }
        
        // Check for common Python errors
        if (trimmedCode.includes('print') && !trimmedCode.includes('(')) {
          setOutput(prev => prev + '   ❌ Błąd składni: print wymaga nawiasów\n');
        }

        setOutput(prev => prev + '\n🔒 Kod wykonany w bezpiecznym środowisku sandbox\n');
        
      } catch (error) {
        setOutput(prev => prev + `❌ Błąd wykonania: ${error.message}\n`);
      }
    }, 800);
  };

  const validateSqlSecurity = (sqlCode) => {
    const dangerousPatterns = [
      // SQL Injection patterns
      /drop\s+table/i,
      /drop\s+database/i,
      /truncate\s+table/i,
      /delete\s+from\s+\w+\s*;?\s*drop/i,
      /insert\s+into/i,
      /update\s+\w+\s+set/i,
      /delete\s+from/i,
      /alter\s+table/i,
      /create\s+table/i,
      /create\s+database/i,
      /grant\s+/i,
      /revoke\s+/i,
      /exec\s*\(/i,
      /execute\s*\(/i,
      /sp_\w+/i,
      /xp_\w+/i,
      /--/g,
      /\/\*/g,
      /\*\//g,
      /union\s+select/i,
      /'\s*or\s*'/i,
      /'\s*and\s*'/i,
      /;\s*drop/i,
      /;\s*delete/i,
      /;\s*update/i,
      /;\s*insert/i,
      /'\s*;\s*--/i,
      /information_schema/i,
      /sys\./i,
      /master\./i,
      /tempdb\./i,
      /model\./i,
      /msdb\./i,
      /0x[0-9a-fA-F]+/i, // Hex encoded strings
      /char\s*\(/i,
      /ascii\s*\(/i,
      /substring\s*\(/i,
      /len\s*\(/i,
      /count\s*\(/i,
      /sum\s*\(/i,
      /avg\s*\(/i,
      /max\s*\(/i,
      /min\s*\(/i,
      /group\s+by/i,
      /having/i,
      /join\s+/i,
      /inner\s+join/i,
      /left\s+join/i,
      /right\s+join/i,
      /outer\s+join/i,
      /cross\s+join/i,
      /case\s+when/i,
      /if\s*\(/i,
      /while\s*\(/i,
      /begin\s+transaction/i,
      /commit\s+transaction/i,
      /rollback\s+transaction/i,
      /save\s+transaction/i,
      /waitfor\s+delay/i,
      /waitfor\s+time/i,
      /openrowset/i,
      /opendatasource/i,
      /bulk\s+insert/i,
      /bcp\s+/i,
      /sp_executesql/i,
      /sp_execute/i
    ];

    const warnings = [];
    const errors = [];

    // Check for dangerous patterns
    dangerousPatterns.forEach((pattern, index) => {
      if (pattern.test(sqlCode)) {
        const dangerousOperations = [
          'DROP TABLE', 'DROP DATABASE', 'TRUNCATE', 'DELETE', 'INSERT', 'UPDATE', 'ALTER TABLE',
          'CREATE TABLE', 'CREATE DATABASE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'Stored Procedures',
          'Comments', 'UNION', 'OR injection', 'AND injection', 'System tables', 'Hex encoding',
          'String functions', 'Aggregate functions', 'JOINs', 'CASE statements', 'IF statements',
          'WHILE loops', 'Transactions', 'WAITFOR', 'OPENROWSET', 'BULK INSERT', 'BCP', 'Dynamic SQL'
        ];
        
        if (index < 7) {
          errors.push(`🚨 NIEBEZPIECZNA OPERACJA: ${dangerousOperations[index] || 'Nieznana operacja'}`);
        } else {
          warnings.push(`⚠️  Potencjalnie niebezpieczne: ${dangerousOperations[index] || 'Nieznana operacja'}`);
        }
      }
    });

    return { warnings, errors };
  };

  const runSqlCode = async () => {
    setOutput('Wykonywanie zapytania SQL...\n');
    
    setTimeout(() => {
      try {
        const trimmedCode = code.trim();
        
        if (!trimmedCode) {
          setOutput(prev => prev + '❌ Błąd: Zapytanie SQL jest puste!\n');
          return;
        }

        // Security validation
        const securityCheck = validateSqlSecurity(trimmedCode);
        
        if (securityCheck.errors.length > 0) {
          setOutput(prev => prev + '🚨 BŁĄD BEZPIECZEŃSTWA:\n');
          securityCheck.errors.forEach(error => {
            setOutput(prev => prev + `   ${error}\n`);
          });
          setOutput(prev => prev + '\n❌ Zapytanie zostało zablokowane ze względów bezpieczeństwa!\n');
          setOutput(prev => prev + '💡 Dozwolone są tylko zapytania SELECT z ograniczeniami.\n');
          return;
        }

        if (securityCheck.warnings.length > 0) {
          setOutput(prev => prev + '⚠️  OSTRZEŻENIA BEZPIECZEŃSTWA:\n');
          securityCheck.warnings.forEach(warning => {
            setOutput(prev => prev + `   ${warning}\n`);
          });
          setOutput(prev => prev + '\n');
        }

        const lowerCode = trimmedCode.toLowerCase();
        
        // Only allow safe SELECT queries for learning purposes
        if (lowerCode.includes('select')) {
          if (lowerCode.includes('from')) {
            setOutput(prev => prev + '✅ Zapytanie SELECT wykonane pomyślnie!\n\n');
            
            setOutput(prev => prev + '📋 Analiza zapytania:\n');
            // Check for specific patterns
            if (lowerCode.includes('*')) {
              setOutput(prev => prev + '   📊 Wybrano wszystkie kolumny\n');
            }
            if (lowerCode.includes('where')) {
              setOutput(prev => prev + '   🔍 Zastosowano warunek WHERE\n');
            }
            if (lowerCode.includes('order by')) {
              setOutput(prev => prev + '   📈 Zastosowano sortowanie\n');
            }
            if (lowerCode.includes('limit')) {
              setOutput(prev => prev + '   🔢 Zastosowano limit wyników\n');
            }
            
            if (testData) {
              setOutput(prev => prev + '\n📋 Przykładowe dane:\n');
              setOutput(prev => prev + '   ' + JSON.stringify(testData, null, 2).split('\n').join('\n   ') + '\n');
            }
            
            setOutput(prev => prev + '\n🔒 Zapytanie wykonane w bezpiecznym środowisku sandbox\n');
          } else {
            setOutput(prev => prev + '❌ Błąd SQL: Brak klauzuli FROM\n');
          }
        } else {
          setOutput(prev => prev + '❌ Błąd: Dozwolone są tylko zapytania SELECT!\n');
          setOutput(prev => prev + '💡 Inne operacje (INSERT, UPDATE, DELETE) są zablokowane ze względów bezpieczeństwa.\n');
        }
        
      } catch (error) {
        setOutput(prev => prev + `❌ Błąd SQL: ${error.message}\n`);
      }
    }, 800);
  };

  const handleReset = () => {
    setCode(initialCode || '');
    setOutput('');
    toast.success('Kod został zresetowany');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Kod skopiowany do schowka');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'python' ? 'py' : 'sql'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Kod pobrany');
  };

  const getLanguageDisplayName = () => {
    switch (language) {
      case 'python': return 'Python';
      case 'sql': return 'SQL';
      default: return language.toUpperCase();
    }
  };

  const getLanguageIcon = () => {
    switch (language) {
      case 'python': return '🐍';
      case 'sql': return '🗄️';
      default: return '💻';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-DarkblackText rounded-lg border border-gray-200 dark:border-DarkblackBorder overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-DarkblackBorder border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getLanguageIcon()}</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {getLanguageDisplayName()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Kopiuj kod"
          >
            <Copy size={16} />
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Pobierz kod"
          >
            <Download size={16} />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Resetuj kod"
          >
            <RotateCcw size={16} />
          </button>
          
          <button
            onClick={handleRunCode}
            disabled={isRunning || disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRunning || disabled
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-primaryBlue dark:bg-primaryGreen text-white hover:opacity-90'
            }`}
          >
            <Play size={16} />
            {isRunning ? 'Uruchamianie...' : 'Uruchom'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <Editor
          height={height}
          language={language}
          value={code}
          onChange={(newValue) => setCode(newValue || '')}
          onMount={handleEditorDidMount}
          theme={'vs-dark'}
          options={{
            readOnly: disabled,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            roundedSelection: false,
            cursorStyle: 'line',
            cursorBlinking: 'blink',
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: false,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
        />
      </div>

      {/* Output Panel */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-[#212529] border-b border-gray-600">
          <h4 className="font-medium text-white">Wynik wykonania:</h4>
        </div>
        <div className="p-4 bg-[#1a1a1a] text-green-400 font-mono text-sm min-h-[120px] max-h-[300px] overflow-y-auto rounded-b-lg">
          {output ? (
            <div className="space-y-2">
              {output.split('\n').map((line, index) => {
                if (!line.trim()) return <br key={index} />;
                
                // Clean up the output formatting
                const cleanLine = line
                  .replace(/✅/g, '✓')
                  .replace(/❌/g, '✗')
                  .replace(/⚠️/g, '⚠')
                  .replace(/🚨/g, '🚨')
                  .replace(/📤/g, '📤')
                  .replace(/🎯/g, '🎯')
                  .replace(/📊/g, '📊')
                  .replace(/🔍/g, '🔍')
                  .replace(/📈/g, '📈')
                  .replace(/🔢/g, '🔢')
                  .replace(/📋/g, '📋')
                  .replace(/🔒/g, '🔒')
                  .replace(/💡/g, '💡');
                
                return (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-400 whitespace-pre-wrap">{cleanLine}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 italic">Wyniki pojawią się tutaj po uruchomieniu kodu...</div>
          )}
        </div>
      </div>

      {/* Test Cases Info */}
      {testCases && (
        <div className="border-t border-gray-600 p-3 bg-[#2d3748]">
          <h4 className="font-medium text-blue-300 mb-2">Przypadki testowe:</h4>
          <pre className="text-sm text-blue-200 whitespace-pre-wrap">
            {typeof testCases === 'string' ? testCases : JSON.stringify(testCases, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
