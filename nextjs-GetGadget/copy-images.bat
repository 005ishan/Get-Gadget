@echo off
echo Copying gadget accessories images...

if not exist "public\images\accessories" mkdir "public\images\accessories"
copy /Y "..\accessories_images\gadget_accessories\*" "public\images\accessories\"

if not exist "public\images\charging" mkdir "public\images\charging"
copy /Y "..\accessories_images\charging\*" "public\images\charging\"

echo Done! Images copied to public/images/
pause
