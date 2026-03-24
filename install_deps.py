"""Cross-platform dependency installer.

On Windows, PyAudio requires Microsoft Visual C++ 14.0+ to build from source.
This script attempts multiple strategies before falling back to sounddevice.

Usage:
    python install_deps.py
"""
import subprocess
import sys
import platform


def run(cmd):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr.strip())
    return result.returncode == 0


def install_pyaudio_windows():
    """Try several strategies to install PyAudio on Windows without a C compiler."""
    # Strategy 1: pipwin (maintains pre-compiled wheels for Windows)
    print("\n[1/3] Trying pipwin...")
    if run([sys.executable, "-m", "pip", "install", "pipwin", "--quiet"]):
        if run([sys.executable, "-m", "pipwin", "install", "pyaudio"]):
            return True

    # Strategy 2: direct wheel from PyPI (works for Python <= 3.12 on some versions)
    print("\n[2/3] Trying PyPI wheel...")
    if run([sys.executable, "-m", "pip", "install", "pyaudio", "--only-binary", ":all:"]):
        return True

    # Strategy 3: sounddevice as a drop-in-compatible fallback (no compiler needed)
    print("\n[3/3] PyAudio not available — installing sounddevice fallback...")
    if run([sys.executable, "-m", "pip", "install", "-r", "requirements-fallback.txt"]):
        print(
            "\n[INFO] sounddevice installed successfully.\n"
            "       If your code imports pyaudio, update it to use sounddevice instead.\n"
            "       See https://python-sounddevice.readthedocs.io for usage."
        )
        return True

    return False


def main():
    py_ver = sys.version_info
    print(f"Python {py_ver.major}.{py_ver.minor}.{py_ver.micro} on {platform.system()}")

    if platform.system() == "Windows":
        print("\nWindows detected — using Windows-specific install strategy.")
        success = install_pyaudio_windows()
    else:
        print("\nNon-Windows — installing from requirements.txt")
        success = run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"]
        )

    if success:
        print("\n✓ Dependencies installed successfully.")
    else:
        print(
            "\n✗ Could not install audio dependencies automatically.\n"
            "  Manual options:\n"
            "  1. Install Visual C++ Build Tools from:\n"
            "     https://visualstudio.microsoft.com/visual-cpp-build-tools/\n"
            "     then run: pip install pyaudio\n"
            "  2. Or use the fallback: pip install -r requirements-fallback.txt"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
