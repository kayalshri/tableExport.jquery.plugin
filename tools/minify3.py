#!/usr/bin/env python3

# Minify tableExport.jquery.plugin file(s)
# using Simon Georget's python script to minify javascript files
# https://github.com/simogeo/Filemanager/blob/master/utils/minify.py
# Usage : $ python ./tools/minify.py

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

    def disable(self):
        self.HEADER = ''
        self.OKBLUE = ''
        self.OKGREEN = ''
        self.WARNING = ''
        self.FAIL = ''
        self.ENDC = ''

import http.client, urllib.request, urllib.parse, urllib.error, sys, os


fmRootFolder = os.path.dirname(os.path.dirname(os.path.realpath(__file__))) + "/"

os.chdir(fmRootFolder) # set working directory

toMinify = ["tableExport.js"]

print(bcolors.HEADER + "-------------------------------------" + bcolors.ENDC)

# we loop on JS languages files
for index, item in enumerate(toMinify):
  # print index, item
  
  dir = os.path.dirname(item)
  file = os.path.basename(item)
  
  with open (fmRootFolder + item, "r") as myfile:
          js_input=myfile.read()

          # Define the parameters for the POST request and encode them in
          # a URL-safe format.

          params = urllib.parse.urlencode([
          ('js_code', js_input),
          #   ('compilation_level', 'WHITESPACE_ONLY'),
          ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
          ('output_format', 'text'),
          ('output_info', 'compiled_code'),
          ])

          params2 = urllib.parse.urlencode([
          ('js_code', js_input),
          #   ('compilation_level', 'WHITESPACE_ONLY'),
          ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
          ('output_format', 'text'),
          ('output_info', 'errors'),
          ])

          # Always use the following value for the Content-type header.
          headers = { "Content-type": "application/x-www-form-urlencoded" }
          conn = http.client.HTTPConnection('closure-compiler.appspot.com')
          conn.request('POST', '/compile', params, headers)
          response = conn.getresponse()
          data = response.read()

          # we write the minified file - os.path.splitext(file)[0]  return filename without extension
          with open(fmRootFolder + dir + '/' + os.path.splitext(file)[0] + ".min.js", "w") as text_file:
                  text_file.write(data.decode("utf-8"))

          # We retrieve errors
          conn.request('POST', '/compile', params2, headers)
          response = conn.getresponse()
          errors = response.read().decode("utf-8")

          
          if errors == "":
                    print(bcolors.OKBLUE + file + " has been minified. No error found.")
          else:
                    print(bcolors.FAIL + file + " : the code contains errors : ")
                    print("")
                    print(errors + bcolors.ENDC)

          conn.close()

print(bcolors.HEADER + "-------------------------------------" + bcolors.ENDC)
