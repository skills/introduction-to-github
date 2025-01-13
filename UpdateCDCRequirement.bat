@echo off
setlocal enabledelayedexpansion

echo Update CDC Requirement Files
set GlowRootPath=%~dp0..\..\..\..\

set configPathCW1=%GlowRootPath%\CargoWiseOne\Configuration

rem Required paths relative to the CargoWise.DbUpgrader folder.
set mappingPathRelative=src\Resource\Resource\CdcRequirement\CdcRequirementMapping.yaml
set outputPathRelative=src\Resource\Resource\CdcRequirement\Config

rem Check if there is a CargoWise.DbUpgrader folder in the GitHub default repository location
set defaultUpgraderPath=C:\git\GitHub\WiseTechGlobal\CargoWise.Shared\CargoWise.DbUpgrader
call :TryUpgraderPath "!defaultUpgraderPath!"
if not "!validity!"=="valid" (
	rem GitHub default repository location is invalid, try old DevOps default repository location
	set defaultUpgraderPath=C:\git\wtg\CargoWise\Shared\CargoWise.DbUpgrader
	call :TryUpgraderPath "!defaultUpgraderPath!"
)

if "!validity!"=="valid" (
	rem Default location is valid, prompt for manual override with the valid default as fallback if blank
	set /p overrideUpgraderPath=Enter CargoWise.DbUpgrader path ^(default !defaultUpgraderPath!^): 
	if "!overrideUpgraderPath!"=="" goto :Run
	call :TryUpgraderPath "!overrideUpgraderPath!"
	if "!validity!"=="valid" goto :Run
) else (
	rem Default location is invalid, prompt without fallback
	set /p overrideUpgraderPath=Enter CargoWise.DbUpgrader path:
	if "!overrideUpgraderPath!"=="" (
		echo Error: CargoWise.DbUpgrader path was not specified.
		exit /B 1
	)
	call :TryUpgraderPath "!overrideUpgraderPath!"
	if "!validity!"=="valid" goto :Run
)

rem Manual override is invalid
echo Error: "!overrideUpgraderPath!" is not a valid CargoWise.DbUpgrader path.
echo There needs to be a "%mappingPath%" file and an "%outputPath%" folder.
exit /B 1

:TryUpgraderPath
set validity=invalid
set mappingPath=%~1\%mappingPathRelative%
set outputPath=%~1\%outputPathRelative%

if exist "%mappingPath%" (
	if exist "%outputPath%\*" (
		set validity=valid
		exit /B 0
	)
)
exit /B 1

:Run
echo Compile CW1 Yaml Files
call %configPathCW1%\CompileYaml.bat

echo Write output files to %outputPath%
"%~dp0CDCRequirementUpdater.exe" --configpaths "%configPathCW1%" --outputpath "%outputPath%" --mappingpath "%mappingPath%"
exit /B %errorlevel%
