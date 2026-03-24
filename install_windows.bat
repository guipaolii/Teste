@echo off
echo ============================================
echo  PyAudio Windows Installer
echo ============================================
echo.
echo Python version:
python --version
echo.

echo [1/3] Trying pipwin (pre-compiled wheels)...
pip install pipwin --quiet
if %errorlevel% == 0 (
    pipwin install pyaudio
    if %errorlevel% == 0 (
        echo.
        echo [OK] PyAudio installed via pipwin.
        goto :done
    )
)

echo.
echo [2/3] Trying PyPI binary wheel...
pip install pyaudio --only-binary :all:
if %errorlevel% == 0 (
    echo.
    echo [OK] PyAudio installed via PyPI wheel.
    goto :done
)

echo.
echo [3/3] Falling back to sounddevice (no compiler required)...
pip install -r requirements-fallback.txt
if %errorlevel% == 0 (
    echo.
    echo [OK] sounddevice installed as fallback.
    echo      Update your code: replace 'import pyaudio' with 'import sounddevice'.
    echo      Docs: https://python-sounddevice.readthedocs.io
    goto :done
)

echo.
echo [FAIL] Could not install audio dependencies automatically.
echo        Option A: Install Visual C++ Build Tools:
echo          https://visualstudio.microsoft.com/visual-cpp-build-tools/
echo        Then run:  pip install pyaudio
echo.
echo        Option B: Use sounddevice fallback:
echo          pip install -r requirements-fallback.txt
pause
exit /b 1

:done
echo.
echo Done!
pause
