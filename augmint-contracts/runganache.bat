@echo Launching ganache-cli (aka testrpc) with deterministic addresses (recent changes in script are not tested)
REM commented out now, nvm use requires admin rights and after it we have a path issue (testrpc cmd not found)
REM @reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT
REM @if %OS%==32BIT nvm use 8.9.1 32
REM @if %OS%==64BIT nvm use 8.9.1
ganache-cli ^
--gasLimit 0x47D5DE ^
--network-id 999 ^
-m "hello build tongue rack parade express shine salute glare rate spice stock"
