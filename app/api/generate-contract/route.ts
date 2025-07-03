import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

interface ContractData {
  companyName: string
  companyId: string
  companyAddress: string
  legalRepName: string
  legalRepId: string
  legalRepAddress: string
  legalRepGender: string
}

export async function POST(request: NextRequest) {
  try {
    const contractData: ContractData = await request.json()
    
    // Validate required fields
    const requiredFields = ['companyName', 'companyId', 'companyAddress', 'legalRepName', 'legalRepId', 'legalRepAddress', 'legalRepGender']
    const missingFields = requiredFields.filter(field => !contractData[field as keyof ContractData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Handle gender representation
    const genderRepresentation = contractData.legalRepGender === 'male' 
      ? 'representado por el señor' 
      : 'representada por la señora'

    // Take the HTML from your document and replace the placeholders
    const htmlContent = `
    <html>
 <head>
  <meta content="text/html; charset=utf-8" http-equiv="content-type"/>
  <style type="text/css">
   @import url(https://themes.googleusercontent.com/fonts/css?kit=xOLi-LS3kvQC5AksusKR8cI6NangsV_Nc05w2tbEY0s);.lst-kix_list_4-1>li{counter-increment:lst-ctn-kix_list_4-1}ol.lst-kix_list_7-0{list-style-type:none}.lst-kix_list_2-1>li{counter-increment:lst-ctn-kix_list_2-1}.lst-kix_list_6-1>li{counter-increment:lst-ctn-kix_list_6-1}.lst-kix_list_8-1>li{counter-increment:lst-ctn-kix_list_8-1}ol.lst-kix_list_8-2.start{counter-reset:lst-ctn-kix_list_8-2 0}ol.lst-kix_list_3-1.start{counter-reset:lst-ctn-kix_list_3-1 0}ol.lst-kix_list_6-6.start{counter-reset:lst-ctn-kix_list_6-6 0}ol.lst-kix_list_7-4.start{counter-reset:lst-ctn-kix_list_7-4 0}.lst-kix_list_5-0>li{counter-increment:lst-ctn-kix_list_5-0}.lst-kix_list_7-0>li{counter-increment:lst-ctn-kix_list_7-0}ol.lst-kix_list_2-3.start{counter-reset:lst-ctn-kix_list_2-3 0}ol.lst-kix_list_7-5{list-style-type:none}ol.lst-kix_list_7-6{list-style-type:none}ol.lst-kix_list_7-7{list-style-type:none}ol.lst-kix_list_7-8{list-style-type:none}ol.lst-kix_list_7-1{list-style-type:none}ol.lst-kix_list_1-5.start{counter-reset:lst-ctn-kix_list_1-5 0}ol.lst-kix_list_7-2{list-style-type:none}ol.lst-kix_list_7-3{list-style-type:none}ol.lst-kix_list_7-4{list-style-type:none}ol.lst-kix_list_5-3.start{counter-reset:lst-ctn-kix_list_5-3 0}.lst-kix_list_2-3>li{counter-increment:lst-ctn-kix_list_2-3}.lst-kix_list_4-3>li{counter-increment:lst-ctn-kix_list_4-3}ol.lst-kix_list_4-5.start{counter-reset:lst-ctn-kix_list_4-5 0}.lst-kix_list_1-2>li{counter-increment:lst-ctn-kix_list_1-2}ol.lst-kix_list_3-7.start{counter-reset:lst-ctn-kix_list_3-7 0}.lst-kix_list_5-2>li{counter-increment:lst-ctn-kix_list_5-2}ol.lst-kix_list_8-8.start{counter-reset:lst-ctn-kix_list_8-8 0}.lst-kix_list_3-2>li{counter-increment:lst-ctn-kix_list_3-2}.lst-kix_list_7-2>li{counter-increment:lst-ctn-kix_list_7-2}ol.lst-kix_list_8-7.start{counter-reset:lst-ctn-kix_list_8-7 0}.lst-kix_list_5-0>li:before{content:"" counter(lst-ctn-kix_list_5-0,upper-roman) ". "}ol.lst-kix_list_6-0{list-style-type:none}ol.lst-kix_list_6-1{list-style-type:none}.lst-kix_list_5-4>li{counter-increment:lst-ctn-kix_list_5-4}.lst-kix_list_1-4>li{counter-increment:lst-ctn-kix_list_1-4}ol.lst-kix_list_1-6.start{counter-reset:lst-ctn-kix_list_1-6 0}.lst-kix_list_5-3>li:before{content:"" counter(lst-ctn-kix_list_5-3,decimal) ". "}.lst-kix_list_5-2>li:before{content:"" counter(lst-ctn-kix_list_5-2,lower-roman) ". "}.lst-kix_list_8-3>li{counter-increment:lst-ctn-kix_list_8-3}.lst-kix_list_5-1>li:before{content:"" counter(lst-ctn-kix_list_5-1,lower-latin) ") "}li.li-bullet-6:before{margin-left:-21.6pt;white-space:nowrap;display:inline-block;min-width:21.6pt}.lst-kix_list_5-7>li:before{content:"" counter(lst-ctn-kix_list_5-7,lower-latin) ". "}.lst-kix_list_5-6>li:before{content:"" counter(lst-ctn-kix_list_5-6,decimal) ". "}.lst-kix_list_5-8>li:before{content:"" counter(lst-ctn-kix_list_5-8,lower-roman) ". "}li.li-bullet-13:before{margin-left:-25.2pt;white-space:nowrap;display:inline-block;min-width:25.2pt}ol.lst-kix_list_6-6{list-style-type:none}ol.lst-kix_list_6-7{list-style-type:none}.lst-kix_list_5-4>li:before{content:"" counter(lst-ctn-kix_list_5-4,lower-latin) ". "}ol.lst-kix_list_6-8{list-style-type:none}.lst-kix_list_5-5>li:before{content:"" counter(lst-ctn-kix_list_5-5,lower-roman) ". "}ol.lst-kix_list_6-2{list-style-type:none}ol.lst-kix_list_6-3{list-style-type:none}ol.lst-kix_list_6-4{list-style-type:none}ol.lst-kix_list_6-5{list-style-type:none}ol.lst-kix_list_1-0.start{counter-reset:lst-ctn-kix_list_1-0 0}.lst-kix_list_6-1>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) ". "}.lst-kix_list_6-3>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) "." counter(lst-ctn-kix_list_6-2,decimal) "." counter(lst-ctn-kix_list_6-3,decimal) ". "}.lst-kix_list_6-5>li{counter-increment:lst-ctn-kix_list_6-5}.lst-kix_list_6-8>li{counter-increment:lst-ctn-kix_list_6-8}.lst-kix_list_6-0>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) ". "}.lst-kix_list_6-4>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) "." counter(lst-ctn-kix_list_6-2,decimal) "." counter(lst-ctn-kix_list_6-3,decimal) "." counter(lst-ctn-kix_list_6-4,decimal) ". "}.lst-kix_list_3-0>li{counter-increment:lst-ctn-kix_list_3-0}ol.lst-kix_list_4-0.start{counter-reset:lst-ctn-kix_list_4-0 0}.lst-kix_list_3-6>li{counter-increment:lst-ctn-kix_list_3-6}li.li-bullet-2:before{margin-left:-36pt;white-space:nowrap;display:inline-block;min-width:36pt}li.li-bullet-21:before{margin-left:-18pt;white-space:nowrap;display:inline-block;min-width:18pt}.lst-kix_list_6-2>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) "." counter(lst-ctn-kix_list_6-2,decimal) ". "}.lst-kix_list_2-5>li{counter-increment:lst-ctn-kix_list_2-5}.lst-kix_list_2-8>li{counter-increment:lst-ctn-kix_list_2-8}ol.lst-kix_list_3-2.start{counter-reset:lst-ctn-kix_list_3-2 0}.lst-kix_list_6-8>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) "." counter(lst-ctn-kix_list_6-2,decimal) "." counter(lst-ctn-kix_list_6-3,decimal) "." counter(lst-ctn-kix_list_6-4,decimal) "." counter(lst-ctn-kix_list_6-5,decimal) "." counter(lst-ctn-kix_list_6-6,decimal) "." counter(lst-ctn-kix_list_6-7,decimal) "." counter(lst-ctn-kix_list_6-8,decimal) ". "}.lst-kix_list_6-5>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) "." counter(lst-ctn-kix_list_6-2,decimal) "." counter(lst-ctn-kix_list_6-3,decimal) "." counter(lst-ctn-kix_list_6-4,decimal) "." counter(lst-ctn-kix_list_6-5,decimal) ". "}.lst-kix_list_6-7>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) "." counter(lst-ctn-kix_list_6-2,decimal) "." counter(lst-ctn-kix_list_6-3,decimal) "." counter(lst-ctn-kix_list_6-4,decimal) "." counter(lst-ctn-kix_list_6-5,decimal) "." counter(lst-ctn-kix_list_6-6,decimal) "." counter(lst-ctn-kix_list_6-7,decimal) ". "}ol.lst-kix_list_2-4.start{counter-reset:lst-ctn-kix_list_2-4 0}.lst-kix_list_6-6>li:before{content:"" counter(lst-ctn-kix_list_6-0,decimal) "." counter(lst-ctn-kix_list_6-1,decimal) "." counter(lst-ctn-kix_list_6-2,decimal) "." counter(lst-ctn-kix_list_6-3,decimal) "." counter(lst-ctn-kix_list_6-4,decimal) "." counter(lst-ctn-kix_list_6-5,decimal) "." counter(lst-ctn-kix_list_6-6,decimal) ". "}ol.lst-kix_list_1-3{list-style-type:none}ol.lst-kix_list_1-4{list-style-type:none}.lst-kix_list_2-7>li:before{content:"" counter(lst-ctn-kix_list_2-7,lower-latin) ". "}.lst-kix_list_2-7>li{counter-increment:lst-ctn-kix_list_2-7}ol.lst-kix_list_1-5{list-style-type:none}.lst-kix_list_7-4>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) "." counter(lst-ctn-kix_list_7-2,decimal) "." counter(lst-ctn-kix_list_7-3,decimal) "." counter(lst-ctn-kix_list_7-4,decimal) ". "}.lst-kix_list_7-6>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) "." counter(lst-ctn-kix_list_7-2,decimal) "." counter(lst-ctn-kix_list_7-3,decimal) "." counter(lst-ctn-kix_list_7-4,decimal) "." counter(lst-ctn-kix_list_7-5,decimal) "." counter(lst-ctn-kix_list_7-6,decimal) ". "}ol.lst-kix_list_1-6{list-style-type:none}ol.lst-kix_list_1-0{list-style-type:none}.lst-kix_list_2-5>li:before{content:"" counter(lst-ctn-kix_list_2-5,lower-roman) ". "}ol.lst-kix_list_6-2.start{counter-reset:lst-ctn-kix_list_6-2 0}ol.lst-kix_list_1-1{list-style-type:none}ol.lst-kix_list_1-2{list-style-type:none}.lst-kix_list_7-2>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) "." counter(lst-ctn-kix_list_7-2,decimal) ". "}.lst-kix_list_7-6>li{counter-increment:lst-ctn-kix_list_7-6}.lst-kix_list_8-6>li{counter-increment:lst-ctn-kix_list_8-6}ol.lst-kix_list_4-6.start{counter-reset:lst-ctn-kix_list_4-6 0}ol.lst-kix_list_3-0.start{counter-reset:lst-ctn-kix_list_3-0 0}.lst-kix_list_5-7>li{counter-increment:lst-ctn-kix_list_5-7}.lst-kix_list_7-7>li{counter-increment:lst-ctn-kix_list_7-7}.lst-kix_list_7-8>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) "." counter(lst-ctn-kix_list_7-2,decimal) "." counter(lst-ctn-kix_list_7-3,decimal) "." counter(lst-ctn-kix_list_7-4,decimal) "." counter(lst-ctn-kix_list_7-5,decimal) "." counter(lst-ctn-kix_list_7-6,decimal) "." counter(lst-ctn-kix_list_7-7,decimal) "." counter(lst-ctn-kix_list_7-8,decimal) ". "}ol.lst-kix_list_4-3.start{counter-reset:lst-ctn-kix_list_4-3 0}ol.lst-kix_list_1-7{list-style-type:none}.lst-kix_list_4-7>li{counter-increment:lst-ctn-kix_list_4-7}ol.lst-kix_list_1-8{list-style-type:none}li.li-bullet-19:before{margin-left:-21.6pt;white-space:nowrap;display:inline-block;min-width:21.6pt}.lst-kix_list_7-8>li{counter-increment:lst-ctn-kix_list_7-8}ol.lst-kix_list_2-5.start{counter-reset:lst-ctn-kix_list_2-5 0}li.li-bullet-1:before{margin-left:-36pt;white-space:nowrap;display:inline-block;min-width:36pt}.lst-kix_list_2-6>li{counter-increment:lst-ctn-kix_list_2-6}.lst-kix_list_4-1>li:before{content:"" counter(lst-ctn-kix_list_4-1,lower-latin) ") "}ol.lst-kix_list_7-3.start{counter-reset:lst-ctn-kix_list_7-3 0}li.li-bullet-22:before{margin-left:-25.2pt;white-space:nowrap;display:inline-block;min-width:25.2pt}.lst-kix_list_4-3>li:before{content:"" counter(lst-ctn-kix_list_4-3,decimal) ". "}.lst-kix_list_4-5>li:before{content:"" counter(lst-ctn-kix_list_4-5,lower-roman) ". "}ol.lst-kix_list_5-7.start{counter-reset:lst-ctn-kix_list_5-7 0}.lst-kix_list_1-8>li{counter-increment:lst-ctn-kix_list_1-8}ol.lst-kix_list_1-4.start{counter-reset:lst-ctn-kix_list_1-4 0}.lst-kix_list_5-5>li{counter-increment:lst-ctn-kix_list_5-5}.lst-kix_list_3-5>li{counter-increment:lst-ctn-kix_list_3-5}ol.lst-kix_list_1-1.start{counter-reset:lst-ctn-kix_list_1-1 0}.lst-kix_list_3-4>li{counter-increment:lst-ctn-kix_list_3-4}ol.lst-kix_list_4-4.start{counter-reset:lst-ctn-kix_list_4-4 0}.lst-kix_list_6-4>li{counter-increment:lst-ctn-kix_list_6-4}li.li-bullet-9:before{margin-left:-18pt;white-space:nowrap;display:inline-block;min-width:18pt}.lst-kix_list_6-3>li{counter-increment:lst-ctn-kix_list_6-3}ol.lst-kix_list_1-3.start{counter-reset:lst-ctn-kix_list_1-3 0}ol.lst-kix_list_2-8.start{counter-reset:lst-ctn-kix_list_2-8 0}ol.lst-kix_list_8-8{list-style-type:none}ol.lst-kix_list_1-2.start{counter-reset:lst-ctn-kix_list_1-2 0}li.li-bullet-11:before{margin-left:-25.2pt;white-space:nowrap;display:inline-block;min-width:25.2pt}ol.lst-kix_list_7-6.start{counter-reset:lst-ctn-kix_list_7-6 0}ol.lst-kix_list_6-1.start{counter-reset:lst-ctn-kix_list_6-1 0}ol.lst-kix_list_8-4{list-style-type:none}ol.lst-kix_list_8-5{list-style-type:none}ol.lst-kix_list_8-6{list-style-type:none}ol.lst-kix_list_8-7{list-style-type:none}ol.lst-kix_list_8-0{list-style-type:none}ol.lst-kix_list_8-1{list-style-type:none}.lst-kix_list_1-1>li:before{content:"" counter(lst-ctn-kix_list_1-1,lower-latin) ". "}ol.lst-kix_list_8-2{list-style-type:none}ol.lst-kix_list_8-3{list-style-type:none}.lst-kix_list_8-5>li{counter-increment:lst-ctn-kix_list_8-5}.lst-kix_list_1-3>li:before{content:"" counter(lst-ctn-kix_list_1-3,decimal) ". "}li.li-bullet-16:before{margin-left:-21.6pt;white-space:nowrap;display:inline-block;min-width:21.6pt}.lst-kix_list_4-8>li{counter-increment:lst-ctn-kix_list_4-8}.lst-kix_list_1-7>li:before{content:"" counter(lst-ctn-kix_list_1-7,lower-latin) ". "}ol.lst-kix_list_5-8.start{counter-reset:lst-ctn-kix_list_5-8 0}ol.lst-kix_list_2-7.start{counter-reset:lst-ctn-kix_list_2-7 0}.lst-kix_list_1-3>li{counter-increment:lst-ctn-kix_list_1-3}.lst-kix_list_1-5>li:before{content:"" counter(lst-ctn-kix_list_1-5,lower-roman) ". "}li.li-bullet-4:before{margin-left:-21.6pt;white-space:nowrap;display:inline-block;min-width:21.6pt}.lst-kix_list_5-6>li{counter-increment:lst-ctn-kix_list_5-6}ol.lst-kix_list_7-5.start{counter-reset:lst-ctn-kix_list_7-5 0}.lst-kix_list_2-1>li:before{content:"" counter(lst-ctn-kix_list_2-1,lower-latin) ". "}ol.lst-kix_list_6-0.start{counter-reset:lst-ctn-kix_list_6-0 0}.lst-kix_list_2-3>li:before{content:"" counter(lst-ctn-kix_list_2-3,decimal) ". "}.lst-kix_list_4-2>li{counter-increment:lst-ctn-kix_list_4-2}ol.lst-kix_list_3-1{list-style-type:none}ol.lst-kix_list_3-2{list-style-type:none}.lst-kix_list_3-1>li{counter-increment:lst-ctn-kix_list_3-1}ol.lst-kix_list_3-3{list-style-type:none}ol.lst-kix_list_3-4.start{counter-reset:lst-ctn-kix_list_3-4 0}.lst-kix_list_5-1>li{counter-increment:lst-ctn-kix_list_5-1}ol.lst-kix_list_3-4{list-style-type:none}ol.lst-kix_list_3-0{list-style-type:none}.lst-kix_list_1-1>li{counter-increment:lst-ctn-kix_list_1-1}.lst-kix_list_7-1>li{counter-increment:lst-ctn-kix_list_7-1}ol.lst-kix_list_2-6.start{counter-reset:lst-ctn-kix_list_2-6 0}.lst-kix_list_3-0>li:before{content:"(" counter(lst-ctn-kix_list_3-0,lower-latin) ") "}ol.lst-kix_list_7-7.start{counter-reset:lst-ctn-kix_list_7-7 0}.lst-kix_list_3-1>li:before{content:"" counter(lst-ctn-kix_list_3-1,lower-latin) ". "}.lst-kix_list_3-2>li:before{content:"" counter(lst-ctn-kix_list_3-2,lower-roman) ". "}.lst-kix_list_8-1>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) ". "}ol.lst-kix_list_1-8.start{counter-reset:lst-ctn-kix_list_1-8 0}.lst-kix_list_4-0>li{counter-increment:lst-ctn-kix_list_4-0}.lst-kix_list_8-2>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) "." counter(lst-ctn-kix_list_8-2,decimal) ". "}.lst-kix_list_6-0>li{counter-increment:lst-ctn-kix_list_6-0}.lst-kix_list_8-0>li{counter-increment:lst-ctn-kix_list_8-0}.lst-kix_list_3-5>li:before{content:"" counter(lst-ctn-kix_list_3-5,lower-roman) ". "}.lst-kix_list_3-4>li:before{content:"" counter(lst-ctn-kix_list_3-4,lower-latin) ". "}.lst-kix_list_3-3>li:before{content:"" counter(lst-ctn-kix_list_3-3,decimal) ". "}ol.lst-kix_list_3-5{list-style-type:none}ol.lst-kix_list_3-6{list-style-type:none}.lst-kix_list_8-0>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) ". "}ol.lst-kix_list_3-7{list-style-type:none}ol.lst-kix_list_3-8{list-style-type:none}.lst-kix_list_8-7>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) "." counter(lst-ctn-kix_list_8-2,decimal) "." counter(lst-ctn-kix_list_8-3,decimal) "." counter(lst-ctn-kix_list_8-4,decimal) "." counter(lst-ctn-kix_list_8-5,decimal) "." counter(lst-ctn-kix_list_8-6,decimal) "." counter(lst-ctn-kix_list_8-7,decimal) ". "}.lst-kix_list_3-8>li:before{content:"" counter(lst-ctn-kix_list_3-8,lower-roman) ". "}.lst-kix_list_8-5>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) "." counter(lst-ctn-kix_list_8-2,decimal) "." counter(lst-ctn-kix_list_8-3,decimal) "." counter(lst-ctn-kix_list_8-4,decimal) "." counter(lst-ctn-kix_list_8-5,decimal) ". "}.lst-kix_list_8-6>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) "." counter(lst-ctn-kix_list_8-2,decimal) "." counter(lst-ctn-kix_list_8-3,decimal) "." counter(lst-ctn-kix_list_8-4,decimal) "." counter(lst-ctn-kix_list_8-5,decimal) "." counter(lst-ctn-kix_list_8-6,decimal) ". "}.lst-kix_list_2-0>li{counter-increment:lst-ctn-kix_list_2-0}.lst-kix_list_8-3>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) "." counter(lst-ctn-kix_list_8-2,decimal) "." counter(lst-ctn-kix_list_8-3,decimal) ". "}.lst-kix_list_3-6>li:before{content:"" counter(lst-ctn-kix_list_3-6,decimal) ". "}.lst-kix_list_3-7>li:before{content:"" counter(lst-ctn-kix_list_3-7,lower-latin) ". "}.lst-kix_list_8-4>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) "." counter(lst-ctn-kix_list_8-2,decimal) "." counter(lst-ctn-kix_list_8-3,decimal) "." counter(lst-ctn-kix_list_8-4,decimal) ". "}ol.lst-kix_list_5-0.start{counter-reset:lst-ctn-kix_list_5-0 0}ol.lst-kix_list_8-5.start{counter-reset:lst-ctn-kix_list_8-5 0}ol.lst-kix_list_4-2.start{counter-reset:lst-ctn-kix_list_4-2 0}.lst-kix_list_8-8>li:before{content:"" counter(lst-ctn-kix_list_8-0,decimal) "." counter(lst-ctn-kix_list_8-1,decimal) "." counter(lst-ctn-kix_list_8-2,decimal) "." counter(lst-ctn-kix_list_8-3,decimal) "." counter(lst-ctn-kix_list_8-4,decimal) "." counter(lst-ctn-kix_list_8-5,decimal) "." counter(lst-ctn-kix_list_8-6,decimal) "." counter(lst-ctn-kix_list_8-7,decimal) "." counter(lst-ctn-kix_list_8-8,decimal) ". "}ol.lst-kix_list_2-2{list-style-type:none}ol.lst-kix_list_2-3{list-style-type:none}ol.lst-kix_list_2-4{list-style-type:none}ol.lst-kix_list_7-2.start{counter-reset:lst-ctn-kix_list_7-2 0}ol.lst-kix_list_2-5{list-style-type:none}.lst-kix_list_4-4>li{counter-increment:lst-ctn-kix_list_4-4}ol.lst-kix_list_2-0{list-style-type:none}ol.lst-kix_list_2-1{list-style-type:none}.lst-kix_list_4-8>li:before{content:"" counter(lst-ctn-kix_list_4-8,lower-roman) ". "}ol.lst-kix_list_6-4.start{counter-reset:lst-ctn-kix_list_6-4 0}.lst-kix_list_4-7>li:before{content:"" counter(lst-ctn-kix_list_4-7,lower-latin) ". "}li.li-bullet-7:before{margin-left:-21.6pt;white-space:nowrap;display:inline-block;min-width:21.6pt}ol.lst-kix_list_5-6.start{counter-reset:lst-ctn-kix_list_5-6 0}ol.lst-kix_list_4-1.start{counter-reset:lst-ctn-kix_list_4-1 0}.lst-kix_list_7-3>li{counter-increment:lst-ctn-kix_list_7-3}li.li-bullet-10:before{margin-left:-25.2pt;white-space:nowrap;display:inline-block;min-width:25.2pt}li.li-bullet-14:before{margin-left:-25.2pt;white-space:nowrap;display:inline-block;min-width:25.2pt}ol.lst-kix_list_4-8.start{counter-reset:lst-ctn-kix_list_4-8 0}.lst-kix_list_8-4>li{counter-increment:lst-ctn-kix_list_8-4}ol.lst-kix_list_3-3.start{counter-reset:lst-ctn-kix_list_3-3 0}ol.lst-kix_list_2-6{list-style-type:none}ol.lst-kix_list_2-7{list-style-type:none}ol.lst-kix_list_2-8{list-style-type:none}ol.lst-kix_list_7-8.start{counter-reset:lst-ctn-kix_list_7-8 0}li.li-bullet-18:before{margin-left:-25.2pt;white-space:nowrap;display:inline-block;min-width:25.2pt}ol.lst-kix_list_7-1.start{counter-reset:lst-ctn-kix_list_7-1 0}ol.lst-kix_list_8-6.start{counter-reset:lst-ctn-kix_list_8-6 0}.lst-kix_list_3-3>li{counter-increment:lst-ctn-kix_list_3-3}ol.lst-kix_list_6-3.start{counter-reset:lst-ctn-kix_list_6-3 0}ol.lst-kix_list_5-5.start{counter-reset:lst-ctn-kix_list_5-5 0}ol.lst-kix_list_8-0.start{counter-reset:lst-ctn-kix_list_8-0 0}.lst-kix_list_7-0>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) ". "}.lst-kix_list_2-2>li{counter-increment:lst-ctn-kix_list_2-2}ol.lst-kix_list_4-7.start{counter-reset:lst-ctn-kix_list_4-7 0}.lst-kix_list_6-2>li{counter-increment:lst-ctn-kix_list_6-2}ol.lst-kix_list_5-0{list-style-type:none}.lst-kix_list_2-6>li:before{content:"" counter(lst-ctn-kix_list_2-6,decimal) ". "}.lst-kix_list_3-7>li{counter-increment:lst-ctn-kix_list_3-7}ol.lst-kix_list_5-1{list-style-type:none}ol.lst-kix_list_5-2{list-style-type:none}.lst-kix_list_2-4>li:before{content:"" counter(lst-ctn-kix_list_2-4,lower-latin) ". "}.lst-kix_list_2-8>li:before{content:"" counter(lst-ctn-kix_list_2-8,lower-roman) ". "}.lst-kix_list_7-1>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) ". "}.lst-kix_list_7-5>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) "." counter(lst-ctn-kix_list_7-2,decimal) "." counter(lst-ctn-kix_list_7-3,decimal) "." counter(lst-ctn-kix_list_7-4,decimal) "." counter(lst-ctn-kix_list_7-5,decimal) ". "}.lst-kix_list_6-6>li{counter-increment:lst-ctn-kix_list_6-6}ol.lst-kix_list_5-4.start{counter-reset:lst-ctn-kix_list_5-4 0}.lst-kix_list_7-3>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) "." counter(lst-ctn-kix_list_7-2,decimal) "." counter(lst-ctn-kix_list_7-3,decimal) ". "}li.li-bullet-20:before{margin-left:-18pt;white-space:nowrap;display:inline-block;min-width:18pt}ol.lst-kix_list_5-1.start{counter-reset:lst-ctn-kix_list_5-1 0}ol.lst-kix_list_5-7{list-style-type:none}.lst-kix_list_6-7>li{counter-increment:lst-ctn-kix_list_6-7}ol.lst-kix_list_5-8{list-style-type:none}ol.lst-kix_list_5-3{list-style-type:none}.lst-kix_list_8-7>li{counter-increment:lst-ctn-kix_list_8-7}ol.lst-kix_list_5-4{list-style-type:none}.lst-kix_list_1-7>li{counter-increment:lst-ctn-kix_list_1-7}ol.lst-kix_list_3-8.start{counter-reset:lst-ctn-kix_list_3-8 0}ol.lst-kix_list_5-5{list-style-type:none}ol.lst-kix_list_5-6{list-style-type:none}.lst-kix_list_7-7>li:before{content:"" counter(lst-ctn-kix_list_7-0,decimal) "." counter(lst-ctn-kix_list_7-1,decimal) "." counter(lst-ctn-kix_list_7-2,decimal) "." counter(lst-ctn-kix_list_7-3,decimal) "." counter(lst-ctn-kix_list_7-4,decimal) "." counter(lst-ctn-kix_list_7-5,decimal) "." counter(lst-ctn-kix_list_7-6,decimal) "." counter(lst-ctn-kix_list_7-7,decimal) ". "}ol.lst-kix_list_8-1.start{counter-reset:lst-ctn-kix_list_8-1 0}.lst-kix_list_7-5>li{counter-increment:lst-ctn-kix_list_7-5}li.li-bullet-17:before{margin-left:-18pt;white-space:nowrap;display:inline-block;min-width:18pt}.lst-kix_list_5-8>li{counter-increment:lst-ctn-kix_list_5-8}.lst-kix_list_4-0>li:before{content:"" counter(lst-ctn-kix_list_4-0,upper-roman) ". "}li.li-bullet-15:before{margin-left:-18pt;white-space:nowrap;display:inline-block;min-width:18pt}.lst-kix_list_3-8>li{counter-increment:lst-ctn-kix_list_3-8}li.li-bullet-3:before{margin-left:-18pt;white-space:nowrap;display:inline-block;min-width:18pt}ol.lst-kix_list_6-8.start{counter-reset:lst-ctn-kix_list_6-8 0}.lst-kix_list_4-6>li{counter-increment:lst-ctn-kix_list_4-6}ol.lst-kix_list_1-7.start{counter-reset:lst-ctn-kix_list_1-7 0}.lst-kix_list_4-4>li:before{content:"" counter(lst-ctn-kix_list_4-4,lower-latin) ". "}ol.lst-kix_list_2-2.start{counter-reset:lst-ctn-kix_list_2-2 0}.lst-kix_list_1-5>li{counter-increment:lst-ctn-kix_list_1-5}ol.lst-kix_list_6-5.start{counter-reset:lst-ctn-kix_list_6-5 0}.lst-kix_list_4-2>li:before{content:"" counter(lst-ctn-kix_list_4-2,lower-roman) ". "}.lst-kix_list_4-6>li:before{content:"" counter(lst-ctn-kix_list_4-6,decimal) ". "}ol.lst-kix_list_7-0.start{counter-reset:lst-ctn-kix_list_7-0 0}ol.lst-kix_list_4-0{list-style-type:none}ol.lst-kix_list_4-1{list-style-type:none}ol.lst-kix_list_4-2{list-style-type:none}ol.lst-kix_list_4-3{list-style-type:none}.lst-kix_list_2-4>li{counter-increment:lst-ctn-kix_list_2-4}ol.lst-kix_list_6-7.start{counter-reset:lst-ctn-kix_list_6-7 0}ol.lst-kix_list_3-6.start{counter-reset:lst-ctn-kix_list_3-6 0}li.li-bullet-8:before{margin-left:-21.6pt;white-space:nowrap;display:inline-block;min-width:21.6pt}li.li-bullet-5:before{margin-left:-21.6pt;white-space:nowrap;display:inline-block;min-width:21.6pt}li.li-bullet-12:before{margin-left:-25.2pt;white-space:nowrap;display:inline-block;min-width:25.2pt}.lst-kix_list_5-3>li{counter-increment:lst-ctn-kix_list_5-3}ol.lst-kix_list_4-8{list-style-type:none}.lst-kix_list_7-4>li{counter-increment:lst-ctn-kix_list_7-4}.lst-kix_list_1-0>li:before{content:"(" counter(lst-ctn-kix_list_1-0,lower-latin) ") "}ol.lst-kix_list_4-4{list-style-type:none}ol.lst-kix_list_4-5{list-style-type:none}.lst-kix_list_1-2>li:before{content:"" counter(lst-ctn-kix_list_1-2,lower-roman) ". "}ol.lst-kix_list_2-0.start{counter-reset:lst-ctn-kix_list_2-0 0}ol.lst-kix_list_4-6{list-style-type:none}ol.lst-kix_list_4-7{list-style-type:none}ol.lst-kix_list_8-4.start{counter-reset:lst-ctn-kix_list_8-4 0}.lst-kix_list_1-4>li:before{content:"" counter(lst-ctn-kix_list_1-4,lower-latin) ". "}ol.lst-kix_list_3-5.start{counter-reset:lst-ctn-kix_list_3-5 0}.lst-kix_list_1-0>li{counter-increment:lst-ctn-kix_list_1-0}.lst-kix_list_8-8>li{counter-increment:lst-ctn-kix_list_8-8}.lst-kix_list_1-6>li{counter-increment:lst-ctn-kix_list_1-6}.lst-kix_list_1-6>li:before{content:"" counter(lst-ctn-kix_list_1-6,decimal) ". "}li.li-bullet-0:before{margin-left:-35.5pt;white-space:nowrap;display:inline-block;min-width:35.5pt}.lst-kix_list_2-0>li:before{content:"(" counter(lst-ctn-kix_list_2-0,lower-latin) ") "}ol.lst-kix_list_2-1.start{counter-reset:lst-ctn-kix_list_2-1 0}ol.lst-kix_list_8-3.start{counter-reset:lst-ctn-kix_list_8-3 0}.lst-kix_list_4-5>li{counter-increment:lst-ctn-kix_list_4-5}.lst-kix_list_1-8>li:before{content:"" counter(lst-ctn-kix_list_1-8,lower-roman) ". "}.lst-kix_list_2-2>li:before{content:"" counter(lst-ctn-kix_list_2-2,lower-roman) ". "}ol.lst-kix_list_5-2.start{counter-reset:lst-ctn-kix_list_5-2 0}.lst-kix_list_8-2>li{counter-increment:lst-ctn-kix_list_8-2}ol{margin:0;padding:0}table td,table th{padding:0}.c32{border-right-style:solid;padding:4pt 4pt 4pt 4pt;border-bottom-color:#000000;border-top-width:0pt;border-right-width:0pt;border-left-color:#000000;vertical-align:top;border-right-color:#000000;border-left-width:0pt;border-top-style:solid;border-left-style:solid;border-bottom-width:0pt;width:233.8pt;border-top-color:#000000;border-bottom-style:solid}.c9{-webkit-text-decoration-skip:none;color:#000000;font-weight:400;text-decoration:underline;vertical-align:baseline;text-decoration-skip-ink:none;font-size:11pt;font-family:"Times New Roman";font-style:normal}.c12{-webkit-text-decoration-skip:none;color:#000000;font-weight:700;text-decoration:underline;vertical-align:baseline;text-decoration-skip-ink:none;font-size:11pt;font-family:"Times New Roman";font-style:normal}.c7{margin-left:36pt;padding-top:6pt;padding-left:3.6pt;padding-bottom:0pt;line-height:1.0;orphans:2;widows:2;text-align:justify}.c0{background-color:#ffffff;color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Times New Roman";font-style:normal}.c20{margin-left:18pt;padding-top:6pt;padding-left:17.5pt;padding-bottom:0pt;line-height:1.0;text-align:justify;margin-right:2.4pt}.c6{margin-left:43.8pt;padding-top:6pt;text-indent:-18pt;padding-bottom:0pt;line-height:1.0;text-align:justify;height:12pt}.c8{color:#000000;font-weight:700;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Times New Roman";font-style:normal}.c4{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Times New Roman";font-style:normal}.c2{padding-top:6pt;padding-bottom:0pt;line-height:1.0;orphans:2;widows:2;text-align:justify;height:12pt}.c14{margin-left:36pt;padding-top:6pt;padding-bottom:0pt;line-height:1.0;padding-left:18pt;text-align:justify}.c5{margin-left:18pt;padding-top:6pt;padding-bottom:0pt;line-height:1.0;padding-left:0pt;text-align:justify}.c26{color:#000000;font-weight:400;text-decoration:none;font-size:11pt;font-family:"Calibri";font-style:normal}.c30{color:#000000;font-weight:700;text-decoration:none;font-size:12pt;font-family:"Times New Roman";font-style:normal}.c22{padding-top:6pt;padding-bottom:0pt;line-height:1.0;orphans:2;widows:2;text-align:justify}.c36{color:#000000;font-weight:400;text-decoration:none;font-size:12pt;font-family:"Helvetica Neue";font-style:normal}.c1{margin-left:54pt;padding-top:6pt;padding-bottom:0pt;line-height:1.0;padding-left:7.2pt;text-align:justify}.c13{padding-top:6pt;padding-bottom:0pt;line-height:1.0;text-align:left;margin-right:31pt;height:12pt}.c38{color:#000000;font-weight:400;text-decoration:none;font-size:12pt;font-family:"Times New Roman";font-style:normal}.c19{padding-top:6pt;padding-bottom:8pt;line-height:1.0791666666666666;orphans:2;widows:2;text-align:center}.c10{margin-left:36pt;padding-top:6pt;padding-bottom:0pt;line-height:1.0;padding-left:3.6pt;text-align:justify}.c15{padding-top:6pt;padding-bottom:0pt;line-height:1.0;text-align:justify;height:12pt}.c40{padding-top:6pt;text-indent:36pt;padding-bottom:8pt;line-height:1.0;text-align:left}.c31{margin-left:72pt;padding-top:6pt;padding-bottom:8pt;line-height:1.0;text-align:left}.c17{padding-top:6pt;padding-bottom:0pt;line-height:1.0;text-align:left}.c33{padding-top:6pt;padding-bottom:0pt;line-height:1.0;text-align:justify}.c42{margin-left:10.8pt;border-spacing:0;border-collapse:collapse;margin-right:auto}.c43{padding-top:0pt;padding-bottom:0pt;line-height:1.0;text-align:center}.c29{padding-top:0pt;padding-bottom:0pt;line-height:1.0;text-align:left}.c16{padding-top:6pt;padding-bottom:0pt;line-height:1.0;text-align:center}.c39{max-width:470.2pt;padding:69.5pt 70.9pt 68pt 70.9pt}.c3{padding:0;margin:0}.c23{orphans:2;widows:2}.c41{margin-left:18pt;padding-left:18pt}.c28{font-size:11pt;font-weight:700}.c18{height:12pt}.c24{vertical-align:baseline}.c34{height:105.5pt}.c21{background-color:#ffffff}.c35{font-weight:700}.c25{margin-left:36pt}.c11{margin-right:5.8pt}.c37{font-size:11pt}.c27{margin-right:5.9pt}.title{padding-top:24pt;color:#000000;font-weight:700;font-size:36pt;padding-bottom:6pt;font-family:"Times New Roman";line-height:1.0;page-break-after:avoid;orphans:2;widows:2;text-align:left}.subtitle{padding-top:18pt;color:#666666;font-size:24pt;padding-bottom:4pt;font-family:"Georgia";line-height:1.0;page-break-after:avoid;font-style:italic;orphans:2;widows:2;text-align:left}li{color:#000000;font-size:12pt;font-family:"Times New Roman"}p{margin:0;color:#000000;font-size:12pt;font-family:"Times New Roman"}h1{padding-top:24pt;color:#000000;font-weight:700;font-size:24pt;padding-bottom:6pt;font-family:"Times New Roman";line-height:1.0;page-break-after:avoid;orphans:2;widows:2;text-align:left}h2{padding-top:18pt;color:#000000;font-weight:700;font-size:18pt;padding-bottom:4pt;font-family:"Times New Roman";line-height:1.0;page-break-after:avoid;orphans:2;widows:2;text-align:left}h3{padding-top:14pt;color:#000000;font-weight:700;font-size:14pt;padding-bottom:4pt;font-family:"Times New Roman";line-height:1.0;page-break-after:avoid;orphans:2;widows:2;text-align:left}h4{padding-top:12pt;color:#000000;font-weight:700;font-size:12pt;padding-bottom:2pt;font-family:"Times New Roman";line-height:1.0;page-break-after:avoid;orphans:2;widows:2;text-align:left}h5{padding-top:11pt;color:#000000;font-weight:700;font-size:11pt;padding-bottom:2pt;font-family:"Times New Roman";line-height:1.0;page-break-after:avoid;orphans:2;widows:2;text-align:left}h6{padding-top:10pt;color:#000000;font-weight:700;font-size:10pt;padding-bottom:2pt;font-family:"Times New Roman";line-height:1.0;page-break-after:avoid;orphans:2;widows:2;text-align:left}
  </style>
 </head>
 <body class="c21 c39 doc-content">
  <div>
   <p class="c23 c18 c29">
    <span class="c24 c36">
    </span>
   </p>
  </div>
  <p class="c16">
   <span class="c8">
    CONTRATO DE SERVICIOS DE CUSTODIA Y TRANSFERENCIA DE FONDOS
   </span>
  </p>
  <p class="c16">
   <span class="c8">
    GIO CAPITAL GROUP SA Y
   </span>
   <span class="c28">
    ${contractData.companyName}
   </span>
  </p>
  <p class="c17 c18">
   <span class="c4">
   </span>
  </p>
  <p class="c17">
   <span class="c4">
    Entre nosotros:
   </span>
  </p>
  <p class="c17 c18">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_2-0 start" start="1">
   <li class="c20 li-bullet-0">
    <span class="c8">
     GIO CAPITAL GROUP SA
    </span>
    <span class="c4">
     (el “
    </span>
    <span class="c12">
     Custodio
    </span>
    <span class="c4">
     ”), cédula jurídica número 3-101-854846, con domicilio social en San José, en este acto representada por el señor Maximiliano Xiques
    </span>
    <span class="c37">
     ,
    </span>
    <span class="c4">
     mayor de edad, Soltero, empresario, vecino de San José, en su condición de representante legal y
    </span>
   </li>
  </ol>
  <p class="c13">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_3-0 start" start="1">
   <li class="c29 c23 c41 li-bullet-1">
    <span>
     ${contractData.companyName}
    </span>
    <span class="c24">
     (el “Cliente”), cédula jurídica número
    </span>
    <span>
     ${contractData.companyId}
    </span>
    <span class="c24">
     , con domicilio social en
    </span>
    <span>
     ${contractData.companyAddress},
    </span>
    <span class="c24">
     en
    </span>
    <span>
    </span>
    <span class="c24">
     este acto
    </span>
    <span>
     ${genderRepresentation} ${contractData.legalRepName}, cédula de identidad ${contractData.legalRepId}, con domicilio en ${contractData.legalRepAddress}.
    </span>
   </li>
  </ol>
  <p class="c33">
   <span class="c4">
    El Custodio y el Cliente podrán ser referidos en este Contrato como las “
   </span>
   <span class="c12">
    Partes
   </span>
   <span class="c4">
    ”, o individualmente, como la “
   </span>
   <span class="c12">
    Parte
   </span>
   <span class="c4">
    ”.
   </span>
  </p>
  <p class="c15">
   <span class="c4">
   </span>
  </p>
  <p class="c16">
   <span class="c8">
    ANTECEDENTES:
   </span>
  </p>
  <p class="c2">
   <span class="c8">
   </span>
  </p>
  <ol class="c3 lst-kix_list_5-0 start" start="1">
   <li class="c14 li-bullet-1">
    <span class="c4">
     El Custodio está debidamente inscrito ante la Superintendencia General de Entidades Financieras (“SUGEF”) para su debida supervisión en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, según lo dispuesto en la Ley N° 7786, “Ley sobre estupefacientes, sustancias psicotrópicas, drogas de uso no autorizado, actividades conexas, legitimación de capitales y financiamiento al terrorismo”, y ostenta la inscripción para realizar las siguientes actividades: administración de recursos financieros por medio de fideicomisos o cualquier otro tipo de administración de recursos, efectuada por personas jurídicas que no sean intermediarios financieros; las operaciones sistemáticas y sustanciales de canje de dinero y transferencias, mediante cheques, giros bancarios, letras de cambio o similares; y las transferencias sistemáticas sustanciales de fondos, realizadas por cualquier medio.
    </span>
   </li>
  </ol>
  <p class="c6">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_5-0" start="2">
   <li class="c14 li-bullet-2">
    <span class="c4">
     El Cliente requiere contratar del Custodio, los servicios de custodia de los fondos económicos que reciba producto de la prestación de los servicios de GIO, los cuales se recibirán posterior a que GIO realice las inversiones que el Cliente le instruirá y que en todo momento deberán ser de conformidad con la legislación aplicable a la actividad regulada para GIO, sea las leyes de los Estados Unidos de América, y su posterior transferencia bancaria dentro de las entidades del sistema bancario nacional a las cuentas del Cliente, y en las cantidades, que oportunamente el Cliente le instruirá al Custodio.
    </span>
   </li>
  </ol>
  <p class="c2">
   <span class="c4">
   </span>
  </p>
  <p class="c17">
   <span class="c8">
    POR TANTO
   </span>
   <span class="c4">
    , con el propósito de consignar en un documento los acuerdos de las Partes, las Partes han convenido en suscribir el presente Contrato de servicios de custodia y transferencia de fondos dentro del territorio de Costa Rica (en adelante el “
   </span>
   <span class="c12">
    Contrato
   </span>
   <span class="c4">
    ”), que se regirá por las siguientes cláusulas y estipulaciones:
   </span>
  </p>
  <p class="c17 c23 c18">
   <span class="c8">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0 start" start="1">
   <li class="c5 c23 li-bullet-3">
    <span class="c8">
     OBJETO DEL CONTRATO.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c7 li-bullet-4">
    <span class="c4">
     Sujeto a los términos y condiciones del presente Contrato, el Custodio se obliga a prestar los servicios de custodia y transferencia de fondos al Cliente (los “
    </span>
    <span class="c12">
     Servicios
    </span>
    <span class="c4">
     ”). Este servicio recaerá únicamente sobre aquellos fondos que provengan de una operación de intercambio de dineros o numerario (o inversiones en general) que GIO haya realizado legalmente en Estados Unidos de América de conformidad con la autorización de MSB que ostenta, y que por instrucciones del Cliente -y en atención a este Contrato- le sean remitidos al Custodio por cuenta del Cliente.
    </span>
   </li>
   <li class="c7 li-bullet-5">
    <span class="c4">
     Una vez recibidos los fondos, el Custodio lo comunicará
    </span>
    <span class="c8">
    </span>
    <span class="c4">
     al Cliente a través de la aplicación o medio que oportunamente decida el Custodio, para lo cual el Cliente acepta que, en caso que se le requiera por parte del Custodio, deberá generar un usuario único y una contraseña para ingresar a la plataforma en donde podrá visibilizar los fondos a su disposición que estén bajo custodia del Custodio
    </span>
    <span class="c0">
     . En cualquier momento, el Cliente podrá instruir al Custodio para que le transfiera parte o todos los fondos tenidos en custodia a las cuentas bancarias propiedad del Cliente que estén abiertas en el sistema bancario nacional, y queda así autorizado el Custodio para revelar la existencia de este Contrato a la entidad financiera que así lo requiera como parte de su proceso de verificación del origen de los fondos a transferir.
    </span>
   </li>
   <li class="c7 li-bullet-6">
    <span class="c0">
     En virtud del contrato de custodia de los fondos del Cliente aquí acordado,
    </span>
    <span class="c4">
     el Custodio abrirá una cuenta de orden dedicada exclusivamente a los fondos del Cliente, bajo la administración del Custodio de conformidad con las instrucciones que el Cliente le gire al respecto a través de los sistemas electrónicos propiedad de GIO que han sido puestos a disposición del del Cliente por su titular únicamente para estos propósitos.
    </span>
   </li>
   <li class="c7 li-bullet-7">
    <span class="c4">
     EL cliente entiende y reconoce que la inscripción del Custodio en SUGEF esta no es una autorización para operar, y la supervisión que ejerce esa Superintendencia es sólo en materia de prevención de legitimación de capitales, financiamiento al terrorismo y financiamiento de la proliferación de armas de destrucción masiva, según lo dispuesto en la Ley N° 7786, “Ley sobre estupefacientes, sustancias psicotrópicas, drogas de uso no autorizado, actividades conexas, legitimación de capitales y financiamiento al terrorismo”. Por lo tanto, la SUGEF no supervisa los negocios que ofrece y realiza el Custodio, ni su seguridad, estabilidad o solvencia. Las personas que contraten sus productos y servicios lo hacen bajo su cuenta y riesgo.
    </span>
   </li>
  </ol>
  <p class="c2">
   <span class="c8">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="2">
   <li class="c5 li-bullet-3">
    <span class="c8">
     PLAZO.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 li-bullet-8">
    <span class="c4">
     Por su naturaleza, este contrato es de duración indefinida.
    </span>
   </li>
   <li class="c10 li-bullet-4">
    <span class="c4">
     No obstante, el Custodio podrá de dar por terminado unilateralmente el presente contrato en cualquier momento sin responsabilidad alguna, siempre que le comunique al Cliente su decisión de terminarlo con al menos siete (7) días naturales de anticipación a la fecha en que desea darlo por finalizado, así como el medio por el cual le entregará los fondos propiedad del Cliente que a dicha fecha conserve bajo su custodia.
    </span>
   </li>
   <li class="c10 li-bullet-6">
    <span class="c4">
     Por su parte, el Cliente podrá dar por terminado este contrato sin antelación alguna, para lo cual deberá instruir al Custodio para que realice la transferencia de los fondos de su propiedad que aún mantenga en custodia a una cuenta bancaria costarricense de este último, la cual se deberá ejecutar en un plazo máximo de siete (7) días naturales.
    </span>
   </li>
   <li class="c10 li-bullet-4">
    <span class="c4">
     En virtud de la normativa aplicable de prevención de lavado de dinero y narcotráfico, en particular la Ley 7786, usted entiende que su información personal y transaccional permanecerá bajo resguardo del Custodio aún terminado este contrato por un plazo mínimo de cinco años.
    </span>
   </li>
   <li class="c10 li-bullet-6">
    <span class="c4">
     Bajo ninguna circunstancia el Custodio o el Cliente estarán obligados a indemnizar a la contraparte por la terminación de este Contrato de conformidad con la presente cláusula.
    </span>
   </li>
  </ol>
  <p class="c15 c25">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="3">
   <li class="c5 li-bullet-3">
    <span class="c8">
     HONORARIOS Y FORMA DE PAGO.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 li-bullet-4">
    <span class="c0">
     El Cliente reconoce y acepta que deberá pagar al Custodio un porcentaje por cada transferencia que realice a favor del Cliente, el cual se define en el tarifario que en cada momento el Custodio tenga vigente.
    </span>
   </li>
   <li class="c10 li-bullet-4">
    <span class="c4">
     Así mismo, el Cliente pagará al Custodio cualesquiera honorarios o multas resultantes en comisiones bancarias por transferencias, así como cualesquiera otros honorarios, costos, cargos, tributos u otros que en general que deriven o tengan causa directa en las acciones u omisiones del Cliente y que por mandato legal deba retener el Custodio por el procesamiento de las transferencias, incluidos los honorarios que pueda cobrar el Custodio al Cliente la prestación de los servicios aquí contratados.
    </span>
   </li>
   <li class="c10 li-bullet-4">
    <span class="c4">
     El Custodio realizará los pagos desde varias cuentas dentro de Costa Rica o USA. Esto lo notificará al cliente con antelación. El cliente podrá solicitar una carta de comprobación por parte del custodia que la cuenta de banco que se utilizo pertenece a al custodio o socios comerciales.
    </span>
   </li>
  </ol>
  <p class="c15 c27">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="4">
   <li class="c5 c27 li-bullet-9" id="h.un0j3v9rp8ft">
    <span class="c8">
     DECLARACIONES Y GARANTÍAS DEL CLIENTE.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 c27 li-bullet-4">
    <span class="c4">
     El Cliente en este acto declara y garantiza lo siguiente:
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-2 start" start="1">
   <li class="c1 c27 li-bullet-10">
    <span class="c4">
     Cuenta con capacidad legal para firmar el Contrato y tiene pleno poder y autoridad para ejecutar y aceptar este Contrato y cumplir con las obligaciones aquí adquiridas.
    </span>
   </li>
   <li class="c1 c27 li-bullet-11">
    <span class="c4">
     Es mayor de edad;
    </span>
   </li>
   <li class="c1 li-bullet-11">
    <span class="c4">
     Es residente legal de la República de Costa Rica;
    </span>
   </li>
   <li class="c1 li-bullet-11">
    <span class="c4">
     Que el uso que hará de los fondos que mantenga bajo el resguardo del Custodio será legal y de conformidad con la normativa aplicables; y que no se usarán bajo ningún concepto para la comisión de ilícitos o pago de actividades sospechosas.
    </span>
   </li>
   <li class="c1 li-bullet-11">
    <span class="c4">
     Cumplirá en todo momento con las políticas de conozca a su cliente, la información suministrada para el proceso de Conozca su cliente, toda la cual debe actualizarse al menos una vez al año y cuando se presenten cambios significativos en la información proporcionada por él.
    </span>
   </li>
   <li class="c1 li-bullet-12">
    <span class="c4">
     El correo electrónico que registrará ante el Custodio debe ser cierto y verdadero, siendo que autoriza al Custodio para remitirle cualquier tipo de notificaciones. Por lo tanto, acepta que toda comunicación enviada a dicho correo electrónico será tenida como recibida y válida por el USUARIO, incluso si el correo electrónico proporcionado es defectuoso, devuelto, ingresa a la carpeta de SPAM – JUNK MAIL – NO DESEADO, no es leído y/o de alguna forma no es visto a pesar de haberse ingresado la dirección de forma correcta.
    </span>
   </li>
   <li class="c1 li-bullet-13">
    <span class="c4">
     Solo mantendrá fondos provenientes de las transacciones que realice GIO en su nombre en la cuenta de orden que el Custodio aperture en su beneficio;
    </span>
   </li>
   <li class="c1 li-bullet-11">
    <span class="c4">
     Será responsable de toda la actividad y por el uso que haga de los fondos transfiera al Custodio en virtud de la prestación de los servicios aquí contratados una vez liquidados los costos y honorarios correspondientes;
    </span>
   </li>
   <li class="c1 li-bullet-14">
    <span class="c4">
     Se compromete a mantener en todo momento de forma segura y secreta su nombre de usuario y contraseña de las aplicaciones de GIO o cualquier otra que el Custodio use como canal de comunicación y conexión con el Cliente, en el entendido de que el uso y resguardo de dichos datos es responsabilidad del Cliente. En este sentido, en caso de que realice un uso inapropiado de la misma y terceros no autorizados realicen gestiones utilizando su clave, estas se tomarán como transacciones realizadas por el Cliente sin responsabilidad alguna para el Custodio;
    </span>
   </li>
   <li class="c1 li-bullet-11">
    <span class="c4">
     Mantendrá la información de la cuenta de custodia y suya propia de forma exacta, completa y actualizada, y mantendrá registrada una cuenta bancaria válida y vigente dentro del territorio de Costa Rica. Lo contrario podría resultar en su imposibilidad de beneficiarse de los servicios aquí contratados a plenitud, sin responsabilidad alguna por parte del Custodio o GIO;
    </span>
   </li>
   <li class="c1 li-bullet-11">
    <span class="c4">
     No transferirá su cuenta de usuario en virtud de que la misma es personalísima;
    </span>
   </li>
   <li class="c1 li-bullet-11">
    <span class="c4">
     Informará inmediatamente al Custodio en caso de olvido o usurpación de sus datos o de su cuenta, o cuando tenga sospechas de que ha habido movimientos no autorizados en la cuenta de orden;
    </span>
   </li>
   <li class="c1 li-bullet-12">
    <span class="c4">
     Autorizará al Custodio, o cualquier otra persona relacionada directa o indirectamente con el Custodio, para que tengan acceso a la base de datos personales para efectos de reportería, cumplimiento, seguimiento y atención de quejas, reclamos, y cualquier otro (según aplique), así como la divulgación de dicha información a cualquier autoridad judicial o administrativa que con competencia que lo requiera, siempre y cuando dicha información o dichos datos fueran necesarios para resolver una investigación administrativa, judicial, una queja, disputa o conflicto del usuario; y a remitir la información adicional que le sea requerida por el Custodio en el plazo máximo de 3 días hábiles contados a partir del día siguiente en que se le remita el requerimiento por vía electrónica, por lo que el Cliente manifiesta entender  y aceptar que el incumplimiento de presentar dicha información será causal para la suspensión o el retiro del Servicio y la cancelación de su cuenta de usuario sin responsabilidad alguna para el Custodio o GIO;
    </span>
   </li>
   <li class="c1 li-bullet-14">
    <span class="c4">
     No simulará la compra de un bien o servicio y que el mismo sea pagado mediante transferencia electrónica haciendo uso de los fondos de su propiedad en la cuenta del Custodio, o bien, realizar cualquier tipo de actividad que directa y/o indirectamente pueda ser considerada un delito o bien una actividad ilícita según el ordenamiento costarricense; y
    </span>
   </li>
   <li class="c1 li-bullet-13">
    <span class="c4">
     Cumplirá a cabalidad, en todo momento de vigencia del Contrato, con las disposiciones contenidas en la Ley 7786, sus reformas y demás normativa aplicable. En caso de que exista error u omisión de información real, exonera al Custodio de toda responsabilidad, y asumirá el Cliente, así como su propietario o su representante legal (si aplica), toda la responsabilidad civil y penal por la omisión de datos reales y veraces. El Custodio se reserva el derecho de suspender o terminar los Servicios o pedir información adicional del cliente y su actividad.
    </span>
   </li>
   <li class="c1 li-bullet-14">
    <span class="c4">
     Informar al Custodio de cualquier situación anómala, queja o inconformidad que tenga con los Servicios.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1" start="2">
   <li class="c10 li-bullet-6">
    <span class="c4">
     Las declaraciones y garantías establecidas en esta cláusula se estimarán que son válidas, firmes, valederas y repetidas en cualquier fecha subsecuente a la firma de este Contrato.
    </span>
   </li>
  </ol>
  <p class="c15 c27">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="5">
   <li class="c5 c11 li-bullet-15">
    <span class="c8">
     DECLARACIONES Y GARANTÍAS DEL CUSTODIO.
    </span>
    <span class="c4">
     El
    </span>
    <span class="c8">
    </span>
    <span class="c4">
     Custodio en este acto declara y garantiza lo siguiente:
    </span>
    <span class="c8">
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 c11 li-bullet-4">
    <span class="c4">
     Está debidamente inscrito como sujeto obligado en la Superintendencia General de Entidades Financieras para la prestación de servicios de administración de recursos financieros por medio de fideicomisos o cualquier otro tipo de administración de recursos (como por ejemplo la custodia), y para la transferencia sistemática de dichos recursos de conformidad con la ley aplicable y este Contrato.
    </span>
   </li>
   <li class="c10 c11 li-bullet-8">
    <span class="c4">
     Generará un reporte semanal electrónico de transferencias recibidas, órdenes de transferencias y saldo en custodia.
    </span>
   </li>
   <li class="c10 c11 li-bullet-16">
    <span class="c4">
     Remitirá los reportes requeridos por las autoridades competentes con la información del Cliente que sea indispensable para estos reportes
    </span>
   </li>
  </ol>
  <p class="c15 c25 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="6">
   <li class="c5 c11 li-bullet-17">
    <span class="c8">
     ACTIVIDADES PROHIBIDAS.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 c11 li-bullet-6">
    <span class="c4">
     La
    </span>
    <span class="c8">
     s
    </span>
    <span class="c4">
     siguientes son actividades prohibidas para el girar órdenes de transferencia electrónica al Custodio:
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-2 start" start="1">
   <li class="c1 c11 li-bullet-10">
    <span class="c4">
     Compra, distribución, producción, o financiamiento de pornografía o cualquier actividad relacionada con explotación sexual o pornografía infantil.
    </span>
   </li>
   <li class="c1 c11 li-bullet-13">
    <span class="c4">
     Casinos y juegos de azar.
    </span>
   </li>
   <li class="c1 c11 li-bullet-12">
    <span class="c4">
     Drogas y sustancias estupefacientes sin autorización de las autoridades competentes y/o cualquier actividad relacionada con Narcotráfico.
    </span>
   </li>
   <li class="c1 c11 li-bullet-13">
    <span class="c4">
     Comercialización de Medicamentos o suplementos alimenticios sin los permisos de salud requeridos.
    </span>
   </li>
   <li class="c1 c11 li-bullet-13">
    <span class="c4">
     Bienes o servicios ilícitos.
    </span>
   </li>
   <li class="c1 c11 li-bullet-11">
    <span class="c4">
     Bienes o servicios que promuevan la violación de derechos humanos de otras personas, incluida la discriminación por cualquier causa, el lavado de dinero, financiamiento o cualquier otra actividad relacionada con terrorismo, y actividades relacionadas con armamento ilegal.
    </span>
   </li>
   <li class="c1 c11 li-bullet-12">
    <span class="c4">
     Copias falsificadas o replicas o cualquier Bien o servicios que atenten contra la propiedad industrial o intelectual de terceras personas.
    </span>
   </li>
   <li class="c1 c11 li-bullet-18">
    <span class="c4">
     Y en general para el pago de bienes o servicios, o realización de transferencias de actividades sujetas a inscripción de conformidad con los artículos 15 y 15 bis de la Ley 7786.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1" start="2">
   <li class="c10 c11 li-bullet-6">
    <span class="c4">
     El Cliente entiende y acepta que esta lista podrá ser modificada por el Custodio en cualquier momento de conformidad con la ley aplicable, por lo que reconoce y acepta que el Custodio podrá cancelar su usuario, cerrar la cuenta y retirar la prestación de los Servicios en caso de que detecte un uso no autorizado de los fondos por financiar actividades prohibidas por el Custodio o por la ley, sin que por ello este último incurra en responsabilidad alguna ni tenga deber de indemnizar al Cliente.
    </span>
   </li>
   <li class="c10 c11 li-bullet-19">
    <span class="c4">
     El Custodio no responderá por el mal uso de los fondos del usuario siempre que estos se hayan realizado a través del sistema electrónico de GIO, y asumirá que toda transferencia u orden recibida por los sistemas de GIO son auténticas y válidas. No obstante, el Custodio facilitará la información a su disposición a las autoridades competentes para determinar si el uso fue fraudulento o mediante la comisión de delito, siempre que dicha información esté razonablemente a su disposición.
    </span>
   </li>
  </ol>
  <p class="c15 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="7">
   <li class="c5 c11 li-bullet-20">
    <span class="c8">
     POLÍTICA CONOZCA A SU CLIENTE.
    </span>
    <span class="c4">
     El Cliente entiende y acepta que  la contratación de los Servicios deberá regirse por las políticas de conozca a su cliente tanto de GIO como del Custodio, así como por todas aquellas normas de la ley aplicable relacionadas a la prevención de lavado de dinero, financiamiento de terrorismo, narcotráfico y armas de destrucción masiva que en cada momento estén vigentes, por lo que suministrará la información que le requiera el Custodio de forma inmediata y quedará a discreción de este último el suspender/terminar los Servicios o pedir información adicional del cliente y su actividad, sin que esto le genere responsabilidad alguna al Custodio frente al Cliente.
    </span>
   </li>
  </ol>
  <p class="c15 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="8">
   <li class="c5 li-bullet-20">
    <span class="c8">
     CONSENTIMIENTO INFORMADO.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 li-bullet-19">
    <span class="c4">
     Por este Contrato el Custodio se compromete a custodiar y administrar su propia base de datos de carácter personal (la “
    </span>
    <span class="c12">
     Base de Datos
    </span>
    <span class="c4">
     ”) en la cual se almacena, entre otra, la siguiente información: nombre completo, domicilio exacto, números de teléfono personales, lugar de trabajo, fecha de nacimiento, récord crediticio y perfil financiero que corresponda al Cliente como parte del cumplimiento de identificación. La información podrá ser usada por el Custodio para validar con terceros y otras fuentes y bases de datos la veracidad de datos personales y crediticios, introducir mejoras al servicio existente y desarrollar nuevos productos, hacer un perfil financiero del Cliente y cualquier otro que sea requerido por la normativa aplicable.
    </span>
   </li>
   <li class="c10 c11 li-bullet-6">
    <span class="c4">
     El Cliente entiende que distintos funcionarios, empleados, representantes y asesores (externos e internos) del Custodio tendrán acceso a dicha información, para el cumplimiento de sus compromisos contractuales. Así mismo, entiende y reconoce que el Custodio podrá revelar a la Superintendencia General de Entidades Financieras, Instituto Costarricense sobre las Drogas, autoridades judiciales, Ministerio Público, Banco Central, Banco Nacional, su oficial de cumplimiento, sus asesores en materia de cumplimiento de la normativa regulatoria aplicable, los burós de crédito, empresas protectoras y gestionadoras de crédito, a sus asesores legales y a cualquier empresa relacionada al Custodio, la información sobre su persona y sus representantes, así como datos atinentes a sus relaciones comerciales y financieras. Asimismo, consiente libre y expresamente para que la información sea traspasada a dichas entidades con fines de información y cumplimiento con la Ley 7786 y normativa aplicable.
    </span>
   </li>
   <li class="c10 c11 li-bullet-4">
    <span class="c4">
     El Custodio reconoce que el Cliente podrá ejercer el derecho de solicitar la rectificación, acceso, actualización y eliminación de la Información en los términos que indica la “Ley de Protección de la Persona Frente al Tratamiento de sus Datos Personales” y su reglamento mediante el mismo medio de notificaciones establecido en el presente documento. El Cliente entiende a su vez, y acepta, que la eliminación de información requerida por la Política de Conozca a su Cliente, las políticas de operación, y cualquier otra que regulatoriamente sea indispensable para el Custodio, podría conllevar la inactivación de su cuenta.
    </span>
   </li>
  </ol>
  <p class="c15 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="9">
   <li class="c5 c11 li-bullet-21">
    <span class="c8">
     INCUMPLIMIENTO POR PARTE DEL CLIENTE.
    </span>
    <span class="c4">
     En caso de no incumplimiento con alguna de las obligaciones a cargo del Cliente, el Custodio tiene la potestad de suspender temporalmente o incluso dar por terminados los Servicios hasta que se proporcione la documentación requerida, sin que se garantice la rehabilitación de los Servicios, lo cual quedará a criterio único y exclusivo del Custodio y sin que esto le genere responsabilidad alguna más allá de hacerle entrega de los fondos que en dicho momento estén bajo custodia.
    </span>
   </li>
  </ol>
  <p class="c15 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="10">
   <li class="c5 c11 li-bullet-3">
    <span class="c8">
     CASO FORTUITO O FUERZA MAYOR.
    </span>
    <span class="c4">
     Por cualquier causa de fuerza mayor que obligue a él Custodio a cerrar y/o interrumpir sus operaciones al público por razones de intervención interna y/o externa, guerras, tumultos, huelgas y/o desastres naturales, el Custodio quedaría inmediatamente liberado de cualquier responsabilidad financiera y a su vez dará derecho al Cliente a dar por terminado el contrato de forma inmediata sin responsabilidad alguna. En ninguna circunstancia, el Custodio estará obligado a indemnizar a la contraparte por la terminación de este Contrato de conformidad con la presente cláusula.
    </span>
   </li>
  </ol>
  <p class="c15 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="11">
   <li class="c5 c11 li-bullet-20">
    <span class="c8">
     LIBERACIÓN RESPONSABILIDAD DEL CUSTODIO
    </span>
    <span class="c4">
     .
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 c11 li-bullet-4">
    <span class="c4">
     Por este Contrato, el Cliente acepta defender, indemnizar y eximir de responsabilidad al Custodio, sus empresas relacionadas, oficiales, directores, miembros, empleados, abogados, y aliados comerciales para la prestación de los Servicios contra todos y cada uno de los reclamos, costos, daños, pérdidas, responsabilidades y gastos (incluidos los honorarios y costos de abogados o acciones judiciales o administrativas) que surjan de o en conexión con:
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-2 start" start="1">
   <li class="c1 c11 li-bullet-10">
    <span class="c4">
     Mal uso de los fondos;
    </span>
   </li>
   <li class="c1 c11 li-bullet-14">
    <span class="c4">
     Mal uso de los Servicios por traslado de otros fondos no remitidos por GIO
    </span>
   </li>
   <li class="c1 c11 li-bullet-22">
    <span class="c4">
     Cuestionamientos de las autoridades respecto al origen o uso de los fondos;
    </span>
   </li>
   <li class="c1 c11 li-bullet-18">
    <span class="c4">
     Incumplimiento o violación de cualquiera de los acuerdos de este Contrato por parte del Cliente;
    </span>
   </li>
   <li class="c1 c11 li-bullet-13">
    <span class="c4">
     Uso por parte del Custodio de la información del Cliente dentro de los criterios aquí definidos.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1" start="2">
   <li class="c10 c11 li-bullet-6">
    <span class="c4">
     El Cliente libera al Custodio de toda y cualquier responsabilidad derivada directa o indirectamente con transferencias de dinero erróneas o que no resulten exitosas por causa de los errores en la información del Cliente que éste último le suministre al Custodio para su operación y contratación de los Servicios.
    </span>
   </li>
   <li class="c10 c11 li-bullet-4">
    <span class="c4">
     En virtud de la obligación del Custodio de recopilar y conservar la información necesaria del Cliente para cumplir con la legislación vigente, específicamente la Ley 7786, el Cliente entiende y acepta que dicha información permanecerá bajo custodia
    </span>
    <span class="c0">
     del Custodio aún terminado este contrato por un plazo mínimo de cinco años.
    </span>
   </li>
  </ol>
  <p class="c2">
   <span class="c0">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="12">
   <li class="c5 c11 li-bullet-9">
    <span class="c8">
     DE LOS TRIBUTOS.
    </span>
    <span class="c4">
     El Cliente acepta que los Servicios estarán sujetos a todos los tributos, comisiones y cargos vigentes, independientemente de cómo se denomine, y en relación con cualquier otro que pueda introducirse en el futuro en cualquier momento, y que el Custodio podrá retener dichos tributos, comisiones o cargos en la fuente y hacer las liquidaciones respectivas ante las autoridades competentes según le sea legalmente requerido, por lo cual realizará las rebajas respectivas para su pago contra la acreditación de cada transferencia de fondos en la cuenta de orden asignada al Cliente; y que en caso que estos fondos no sean suficientes, los fondos transferidos se mantendrán en su cuenta de orden hasta que sean suficientes para el cumplimiento del deber de retención y liquidación respectiva sin que esto pueda interpretarse como una retención indebida, injustificada, o causa de reclamo civil o penal alguno en contra del Custodio.
    </span>
   </li>
  </ol>
  <p class="c2 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="13">
   <li class="c5 c11 li-bullet-3">
    <span class="c8">
     NOTIFICACIONES.
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 c11 li-bullet-4">
    <span class="c4">
     Toda comunicación bajo este Contrato será hecha por escrito y enviadas o entregadas a mano con razón de recibido a cada una de las partes aquí contratantes, a las direcciones indicadas a continuación:
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-2 start" start="1">
   <li class="c1 c11 li-bullet-10">
    <span class="c4">
     A el Custodio:
    </span>
   </li>
  </ol>
  <p class="c23 c25 c11 c40">
   <span class="c4">
    Correo Electrónico: alberto@galileo.finance.com
   </span>
  </p>
  <p class="c23 c18 c11 c31">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-1" start="2">
   <li class="c10 c21 li-bullet-4">
    <span class="c4">
     Cualquier cambio vinculado con las direcciones físicas y de correo electrónico aquí establecidos se estimarán como válidos una vez que éstos sean notificados por escrito y confirmados previamente por la Parte a quien se le hiciere la notificación, sin lo cual dichas modificaciones no surtirán sus efectos y se tendrán como válidas las últimas direcciones utilizados por las Partes.
    </span>
   </li>
  </ol>
  <p class="c15 c21">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_7-0" start="14">
   <li class="c5 li-bullet-21">
    <span class="c8">
     LEY APLICABLE Y JURISDICCIÓN COMPETENTE
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_7-1 start" start="1">
   <li class="c10 li-bullet-4">
    <span class="c4">
     El Contrato está sometido a las leyes de la República de Costa Rica.
    </span>
   </li>
   <li class="c10 li-bullet-5">
    <span class="c4">
     En caso de diferencias, conflictos o disputas relacionadas con la ejecución, incumplimiento, interpretación o cualquier otro aspecto derivado del presente contrato acuerdan resolver el conflicto mediante un proceso arbitral por medio de cual se dictará un laudo definitivo e inapelable de conformidad con los el Reglamento de Arbitraje del Centro Internacional de Conciliación y Arbitraje ("CICA") de la Cámara Costarricense Norteamericana de Comercio (AMCHAM), a cuyas normas procesales, en todo lo que no contravenga Io establecido en esta cláusula, las partes se someten de forma voluntaria e incondicional. El conflicto se dilucidará de acuerdo con la ley sustantiva de la República de Costa Rica y el idioma del arbitraje será el castellano.  El lugar del arbitraje será el Centro Internacional de Conciliación y Arbitraje ("CICA") de la Cámara Costarricense Norteamericana de Comercio (AMCHAM), República de Costa Rica.  El arbitraje será resuelto por un tribunal arbitral compuesto por tres árbitros designado por el CICA.  El CICA será la institución encargada de administrar el proceso arbitral y en ausencia de regla procedimental expresa en su Reglamento, las partes delegan en el Tribunal Arbitral el señalamiento de esta. El laudo arbitral se dictará por escrito, será definitivo, vinculante para las partes e inapelable. Los procesos y su contenido serán absolutamente confidenciales. Queda entendido que el arbitraje podrá ser solicitado por cualquiera de las partes de este contrato. En caso de que en el momento en que deba resolverse el conflicto, el Centro aquí asignado no esté prestando los servicios anteriormente referidos, el conflicto se resolverá mediante un proceso arbitral que se tramitará de conformidad con la ley aplicable vigente a dicho momento en la República de Costa Rica. En el proceso de resolución alternativa de conflictos correspondiente se determinará a cuál o cuáles partes les corresponde pagar los gastos y honorarios de dicho proceso y en qué proporción, en principio el perdidoso pagará los gastos.
    </span>
   </li>
  </ol>
  <p class="c2 c11">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_8-0 start" start="1">
   <li class="c5 c11 li-bullet-20">
    <span class="c8">
     CESIÓN.
    </span>
    <span class="c4">
     El Custodio podrá ceder o transferir sus obligaciones bajo este Contrato sin necesidad de autorización previa por parte del Cliente. Por la naturaleza de este Contrato, el Cliente entiende, acepta y reconoce que su cuenta es personalísima, y que no podrá cederla total ni parcialmente, así como tampoco lo podrá hacer con ninguno de los derechos que aquí se le conceden.
    </span>
   </li>
  </ol>
  <p class="c15 c21">
   <span class="c4">
   </span>
  </p>
  <p class="c15 c21">
   <span class="c4">
   </span>
  </p>
  <ol class="c3 lst-kix_list_8-0" start="2">
   <li class="c5 li-bullet-3">
    <span class="c8">
     MISCELÁNEAS
    </span>
   </li>
  </ol>
  <ol class="c3 lst-kix_list_8-1 start" start="1">
   <li class="c10 li-bullet-4">
    <span class="c9">
     Buena fe
    </span>
    <span class="c4">
     : El presente documento refleja la voluntad de las partes, debidamente otorgada bajo los principios de buena fe y responsabilidad en los negocios, por lo tanto, ningún error material o de forma que pudiera contener el presente documento será impedimento para el cumplimiento de los fines que se deduzcan del mismo. Las partes manifiestan conocer y entender el valor y consecuencias legales de sus renuncias y estipulaciones de este Contrato, y manifiestan expresamente que es su voluntad su formalización.
    </span>
   </li>
   <li class="c10 li-bullet-16">
    <span class="c9">
     Anexos
    </span>
    <span class="c4">
     : Los Anexos se incorporan por referencia y son parte integral de este contrato para todos los efectos.
    </span>
   </li>
   <li class="c10 li-bullet-16">
    <span class="c9">
     Acuerdo completo
    </span>
    <span class="c4">
     : Las Partes dejan constancia expresa de que este Contrato es el resultado de negociaciones y de concesiones mutuas entre ellas, que a todas beneficia y aprovecha, que han sido realizadas de forma voluntaria y con la asesoría que cada cual ha considerado necesarias a efecto de tomar decisiones informadas. Igualmente declaran que cualesquiera discusiones, promesas, representaciones y entendimientos previos pero relacionados con los asuntos aquí contratados han sido sustituidos en su totalidad por este Contrato y por lo tanto son inaplicables a partir de su firma.
    </span>
   </li>
   <li class="c10 li-bullet-4">
    <span class="c9">
     Ambigüedad
    </span>
    <span class="c4">
     : En caso de cualquier ambigüedad, cuestionamiento de intención o interpretación de sus disposiciones, se entenderá que este Contrato ha sido revisado y negociado por las Partes y ninguna presunción o carga de la prueba podrá beneficiar o cargarse a ninguna de las Partes en virtud de la autoría de cualquiera de las disposiciones de este Contrato.
    </span>
   </li>
   <li class="c10 li-bullet-4">
    <span class="c9">
     Modificaciones
    </span>
    <span class="c4">
     : Cualquier acuerdo de modificación, cambio o nuevas garantías que acuerden las Partes a este Contrato, sea total o parcial, será válido en el tanto sea documentado por escrito y suscrito por todas ellas.
    </span>
   </li>
   <li class="c10 li-bullet-7">
    <span class="c9">
     Divisibilidad
    </span>
    <span class="c4">
     : Si alguna disposición de este Contrato resultare inválida o ilegal se tendrá por no puesta, pero la legalidad y validez del resto del Contrato no se verá afectada o limitada por dicha omisión.
    </span>
   </li>
   <li class="c10 li-bullet-4">
    <span class="c9">
     Renuncia
    </span>
    <span class="c4">
     : Ningún incumplimiento de los términos de este Contrato podrá ser desestimado de no ser por escrito por la parte que pueda desestimarlo. La desestimación y renuncia de cualquiera de las partes, o el hecho de no reclamar el incumplimiento de cualquier cláusula de este Contrato, no será entendido como la renuncia a cualquier reclamo por incumplimiento subsiguiente.
    </span>
   </li>
   <li class="c10 li-bullet-8">
    <span class="c9">
     Protocolización
    </span>
    <span class="c4">
     : Cualquiera de las Partes podrá comparecer ante Notario Público a protocolizar, autenticar su firma o poner razón de fecha cierta a este documento, sin que para ello requiera la participación, notificación o autorización de la otra.
    </span>
   </li>
   <li class="c10 li-bullet-6">
    <span class="c9">
     Títulos y encabezados
    </span>
    <span class="c4">
     : Los títulos y encabezados contenidos en este Contrato son para facilidad de referencia únicamente y no deberán ser empleados en su interpretación
    </span>
   </li>
  </ol>
  <p class="c15 c25">
   <span class="c4">
   </span>
  </p>
  <p class="c22">
   <span class="c4">
    Como constancia de aceptación y consentimiento, las Partes suscribimos el presente Contrato en San José, en dos tantos de un mismo original, en las fechas que se indica en el bloque de firmas, en dos tantos de un mismo original.
   </span>
  </p>
  <p class="c15 c21">
   <span class="c4">
   </span>
  </p>
  <p class="c15">
   <span class="c8">
   </span>
  </p>
  <p class="c15">
   <span class="c8">
   </span>
  </p>
  <p class="c2">
   <span class="c0">
   </span>
  </p>
  <p class="c2 c11">
   <span class="c4">
   </span>
  </p>
  <table class="c42">
   <tr class="c34">
    <td class="c32" colspan="1" rowspan="1">
     <p class="c19">
      <span class="c8">
       P/ El Custodio
      </span>
     </p>
     <p class="c16 c23">
      <span class="c8">
       GIO CAPITAL GROUP SA
      </span>
     </p>
     <p class="c16 c23 c18">
      <span class="c8">
      </span>
     </p>
     <p class="c16 c23 c18">
      <span class="c8">
      </span>
     </p>
     <p class="c16 c23">
      <span class="c8">
       _________________________
      </span>
     </p>
     <p class="c16 c23">
      <span class="c8">
       Maximiliano Xiques
      </span>
     </p>
    </td>
    <td class="c32" colspan="1" rowspan="1">
     <p class="c16 c23">
      <span class="c8">
       P/ El Cliente
      </span>
     </p>
     <p class="c16">
      <span class="c28">
       ${contractData.companyName}
      </span>
     </p>
     <p class="c17 c23 c18">
      <span class="c28">
       <br/>
       <br/>
      </span>
     </p>
     <p class="c16 c23">
      <span class="c28">
       __
      </span>
      <span class="c8">
       _________________________
      </span>
     </p>
     <p class="c16 c23">
      <span class="c35">
       ${contractData.legalRepName}
      </span>
     </p>
    </td>
   </tr>
  </table>
  <p class="c17 c18">
   <span class="c26 c24">
   </span>
  </p>
  <div>
   <p class="c23 c18 c43">
    <span class="c26 c24">
    </span>
   </p>
  </div>
 </body>
</html>

    
    Just replace:
    {{COMPANY_NAME}} with ${contractData.companyName}
    {{COMPANY_ID}} with ${contractData.companyId}
    {{COMPANY_ADDRESS}} with ${contractData.companyAddress}
    {{LEGAL_REP_NAME}} with ${contractData.legalRepName}
    {{LEGAL_REP_ID}} with ${contractData.legalRepId}
    {{LEGAL_REP_ADDRESS}} with ${contractData.legalRepAddress}
    {{GENDER_REPRESENTATION}} with ${genderRepresentation}
    `

    // Generate PDF
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Contrato_${contractData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating contract:', error)
    return NextResponse.json(
      { error: 'Failed to generate contract' },
      { status: 500 }
    )
  }
}
