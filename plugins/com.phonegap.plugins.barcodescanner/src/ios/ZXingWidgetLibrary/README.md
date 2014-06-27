The project includes a Build Phase to generate a fat universal library, taken from http://stackoverflow.com/questions/3520977/build-fat-static-library-device-simulator-using-xcode-and-sdk-4.

When build, check the Products folder. There should be a folder called *Release-universal*, the public header is in the other folders, under *include*.