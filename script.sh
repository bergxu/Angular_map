#!/bin/sh

android_res_path="./platforms/android/res/"

if [ ! -d "${android_res_path}drawable-port-ldpi" ]; then
	mkdir ${android_res_path}drawable-port-ldpi
fi
cp -p ./www/res/screens/android/screen-ldpi-portrait.png ${android_res_path}drawable-port-ldpi/screen.png

if [ ! -d "${android_res_path}drawable-land-ldpi" ]; then
	mkdir ${android_res_path}drawable-land-ldpi
fi
cp -p ./www/res/screens/android/screen-ldpi-landscape.png ${android_res_path}drawable-land-ldpi/screen.png

if [ ! -d "${android_res_path}drawable-port-mdpi" ]; then
	mkdir ${android_res_path}drawable-port-mdpi
fi
cp -p ./www/res/screens/android/screen-mdpi-portrait.png ${android_res_path}drawable-port-mdpi/screen.png

if [ ! -d "${android_res_path}drawable-land-mdpi" ]; then
	mkdir ${android_res_path}drawable-land-mdpi
fi
cp -p ./www/res/screens/android/screen-mdpi-landscape.png ${android_res_path}drawable-land-mdpi/screen.png

if [ ! -d "${android_res_path}drawable-port-hdpi" ]; then
	mkdir ${android_res_path}drawable-port-hdpi
fi
cp -p ./www/res/screens/android/screen-hdpi-portrait.png ${android_res_path}drawable-port-hdpi/screen.png

if [ ! -d "${android_res_path}drawable-land-hdpi" ]; then
	mkdir ${android_res_path}drawable-land-hdpi
fi
cp -p ./www/res/screens/android/screen-hdpi-landscape.png ${android_res_path}drawable-land-hdpi/screen.png

if [ ! -d "${android_res_path}drawable-port-xhdpi" ]; then
	mkdir ${android_res_path}drawable-port-xhdpi
fi
cp -p ./www/res/screens/android/screen-xhdpi-portrait.png ${android_res_path}drawable-port-xhdpi/screen.png

if [ ! -d "${android_res_path}drawable-land-xhdpi" ]; then
	mkdir ${android_res_path}drawable-land-xhdpi
fi
cp -p ./www/res/screens/android/screen-xhdpi-landscape.png ${android_res_path}drawable-land-xhdpi/screen.png
