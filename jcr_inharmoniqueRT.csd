<CsoundSynthesizer>
<CsInstruments>
; ===================================================================
; RISSET'S INHARMONIQUE (1977)
; Adapted from
; Lorrain, Denis (1980)
;    "Analyse de la bande magnetique de l'oeuvre de Jean-Claude Risset - Inharmonique"
;    in Rapports IRCAM 26/80.
; different version of SV1 values for PLF6 provided by Jean-Claude Risset
; 		Developed by:
; 		2011-19
; ===================================================================

sr      = 48000
ksmps   = 8
nchnls  = 2

giamp_fact	= 16	; Amplitude factor

; ==============================
; S 1 - NOISE4.ORC:
; ==============================
;  GLISSANDI DE BRUIT
instr 1005, 1006
; This version consolidates instruments for a better efficiency
ichannel = ( p1 == 1005 ? 1 : 2 )
iDUR	= 1/p3
iP5	= p4 * giamp_fact	; Amplitude
iP6	= p5	; center frequency
iP7	= p6	; bandwidth
iV1	= 1

ifn1 = 1001
ifn5 = 1005
ifn6 = 1006
ifnx	=	(p1 == 1005 ? ifn5 : ifn6)
ifn7 = 1007
ifn8 = 1008

aB5	oscili  iV1, iDUR, ifnx
aB4	oscili	100, iDUR, ifn7
aB4	randh	iV1, aB4
aB3	=	aB5 * iP5
aB5	=	aB5 * 0.2
aB5	=	aB5 * aB4
aB5	=	iV1 + aB5
aB5	=	iP7 * aB5
aB3	randi	aB3, aB5
aB6	oscili	iP6, iDUR, ifn8
aB4	=	aB4 * 0.2
aB4	=	iV1 + aB4
aB6	=	aB4 * aB6
aB3	oscili	aB3, aB6, ifn1
	outch ichannel, aB3
endin

; ==============================
; S 2 - VOXN1.ORC:
; ==============================
instr 2105
iDUR	=	1 / p3
iP5	=	p4 * 0.3125 * giamp_fact	; (not p4)
iP6	=	p5
iP10	=	p9
iP11	=	p10
iP12	=	p11
iP13	=	p12
iP14	=	p13

ifn1 = 2101
ifn5 = 2105
ifn6 = 2106

aB4     oscili	iP6,  iDUR,  ifn5
aB5     oscili	iP5,  (aB4 + iP10),  ifn1
aB6     oscili	iP5,  (aB4 + iP11),  ifn1
aB7     oscili	iP5,  (aB4 + iP12),  ifn1
aB8     oscili	iP5,  (aB4 + iP13),  ifn1
aB9     oscili	iP5,  (aB4 + iP14),  ifn1
aB3	=	aB5+aB6+aB7+aB8+aB9
aB3     oscili 	aB3, iDUR, ifn6
	outch 1, aB3, 2, aB3
endin
; ==============================
; S 2 - RVP411.ORC:
; ==============================
gaB2206    init 0

instr 2205
iDUR	=	1/ p3
iP5	=	p4 * 0.3125 * giamp_fact	; amplitude P5
iP6	=	p5	; frequency P6

ifn1 = 2201
ifn2 = 2202

aB3	oscili	iP5,  iDUR,  ifn2
aB4	oscili	aB3,    iP6, ifn1
	outch 1,	aB4
gaB2206	=	gaB2206 + aB4
endin

instr 2206
iDUR	=	1/ p3
iP5	=	p4 * 0.3125 * giamp_fact	; amplitude P5
iP6	=	p5	; frequency P6
iV11	=	p6

ifn1 = 2201
ifn2 = 2202

aB3	oscili	iP5,  iDUR,  ifn2
aB4	oscili	aB3,    iP6, ifn1
	outch 2,	aB4
gaB2206	=	gaB2206 + aB4 * iV11
endin

; ==============================
; S 2 - RVP411.ORC rev:
; ==============================
instr 9246
aB7	alpass	gaB2206,    0.47828,    0.03090
aB7	alpass	aB7,    0.41303,    0.02210
aB7	alpass	aB7,    0.23022,    0.01400
aB7	alpass	aB7,    0.10550,    0.00630
aB8	alpass	aB7,    0.04057,    0.00300
aB8	tone	aB8,   5000		;	! ! !
	outs	aB8,  aB8
gaB2206	=	0
endin

instr 9250
aB7	alpass	gaB2206,    1.53555,    0.06395
aB7	alpass	aB7,    0.93259,    0.04435
aB7	alpass	aB7,    0.57843,    0.03095
aB7	alpass	aB7,    0.36424,    0.02215
aB7	alpass	aB7,    0.23529,    0.01405
	outs	aB7,  aB7
gaB2206	=	0
endin

; S 3 - global variables:
giamp_factLB1113 = 8;
gaB3206    init 0
gaB3207    init 0

; ==============================
; S 3 - FM8.ORC:
; ==============================
instr 3120, 3121
;			 FM INSTRUMENTS                     ;
idur	=	1/p3
iamp	=	p4 * giamp_fact   ;  normalize from 2048 to 32000
ifc	=	p5
ifm	=	p6
imax	=	p8 * ifm
imin	=	p7 * ifm
iphs	=	p9 / 512

ifn1 = 3101
ifn2 = 3102
ifn3 = 3103
ifn5 = 3105

ichannel = ( p1 == 3120 ? 1 : 2 )

aamp	oscili	iamp, idur, ifn2, iphs

a1	oscili	imax, idur, ifn3
a2	oscili	(a1 + imin), ifm, ifn1
a3  	oscili 	aamp, (ifc + a2), ifn1
a4	oscili 	a3, idur, ifn5

	outch ichannel, a4
endin


; ==============================
; S 3 - LB1113.ORC:
; ==============================
instr     3205, 3206, 3207, 3208, 3215, 3216, 3217, 3218,  3225, 3226, 3227, 3228,  3235, 3236, 3237, 3238
; This version consolidates instruments for a better efficiency
; the main differences are:
    ; i(320)5 & 6 use F2 for envelope // i(320)7 & 8 use F3 for envelope
    ; i(320)5 & 7 use left output // i(320)6 & 8 use rigth output
    
    ;NOTE due to realtime generation and impossibility of changing ftables in use, 
    ; instruments are instatiated according to section
ichannel = ( (p1 % 10 == 5) || (p1 % 10 == 7) ? 1 : 2 )


ifn1 = 3201
ifn1 = ( (p1 > 3210) ? 3211 : ifn1 )
ifn1 = ( (p1 > 3220) ? 3212 : ifn1 )
ifn1 = ( (p1 > 3230) ? 3213 : ifn1 )

ifn2 = 3202
ifn3 = 3203
ifnX = ( (p1 % 10 == 5) || (p1 % 10 == 6) ? ifn2 : ifn3 ) 

iG80	=	 p6

iDUR	=	1/p3

iP5	=	p4 * iG80 * giamp_factLB1113     ; SEC1-2 = 6.25, SEC3 = 1
iP6	=	p5

aB3	oscili	iP5,     iDUR,     ifnX
aB3	oscili	aB3,     iP6,     ifn1
	outch ichannel, aB3
endin


; ==============================
; S 3 - LOSLO3.ORC:
; ==============================
; RALLENTANDO PERPETUEL
instr 3301
gaB3206	=	0
gaB3207	=	0
endin

; PITCH EFFECT
instr 3302
iDUR	=	1/p3
iP5	=	p4 * .78125 * giamp_fact 
iP6	=	p5		;	frequency: A from 27.5 to 3520 Hz
iP7	=	1/p6		;	envelope duration
iP8	=	p7 / 4096	; 	envelope phase

ifn1 = 3301
ifn5 = 3305

aB31	oscili	iP5, iP7, ifn5, iP8	; envelope
aB32	oscili	aB31, iP6, ifn1
	; outs aB32, aB32
gaB3206	=	aB32 + gaB3206
endin

; GLOBAL ENVELOPE
instr	3303
iDUR	=	1/p3

ifn7 = 3307

aB6	oscili	gaB3206, iDUR, ifn7
		;outch 2, aB6
gaB3207	=	gaB3207 + aB6
endin

; RHYTMIC EFFECT
instr	3304
iP5	=	p4
iP6	=	p5
iP7	=	1/p6
iP8	=	p7 / 4096

ifn2 = 3302
ifn3 = 3303
ifn4 = 3304

aB3	oscili	iP5, iP7, ifn2, iP8	; IOS[b]
aB4	oscili	iP6, iP7, ifn3, iP8	; IOS[a]
aB3	oscili	aB3, aB4, ifn4		; IOS[c]
		outch 1, 	aB3 * gaB3207
endin

; ==============================
; S 3 - PHASE6.ORC:
; ==============================
;	HARMONIC CASCADE                     ;
; this instrument is a simpler version.
; instead of giving all frequencies, we provide an offset
; and the instrument calculates all frequencies needed.
instr	3405, 3406
iDUR 	=	1/p3
iP5	=	p4 * giamp_fact
; frequency offsets
iP7	=	p6
iP8	=	p6 + p7
iP9	=	p6 + p7 * 2
iP10	=	p6 + p7 * 3
iP11	=	p6 + p7 * 4
iP12	=	p6 - p7
iP13	=	p6 - p7 * 2
iP14	=	p6 - p7 * 3
iP15	=	p6 - p7 * 4

ichannel = ( p1 == 3405 ? 1 : 2 )

iV2	= 1
ifn2 = 3402
ifn5	=	p5	; (SET P6)

aB3	oscili	iP5,iP7,ifn2
aB4	oscili	iP5,iP8,ifn2  
aB5	oscili	iP5,iP9,ifn2  
aB3	=	aB3 + aB4 + aB5
aB4	oscili	iP5,iP10,ifn2  
aB5	oscili	iP5,iP11,ifn2
aB6	oscili	iP5,iP12,ifn2
aB4	=	aB4 + aB5 + aB6
aB5	oscili	iP5,iP13,ifn2  
aB6	oscili	iP5,iP14,ifn2  
aB7	oscili	iP5,iP15,ifn2
aB5	=	aB5 + aB6 + aB7
aB3	=	aB3 + aB4 + aB5 ; add all partial results

aB4	oscili	iV2, iDUR, ifn5
aB4	=	aB4 * aB4
aB3	=	aB3 * aB4

	outch ichannel, aB3
endin

; ==============================
; S 4 - BELHH4.ORC:
; ==============================
instr 4103

iDUR	=	1 / p3
iP5	=	p4 * giamp_fact 
iP6	=	p5

ifn1 = 4101
ifn3 = 4103

aB3	oscili	iP5, iDUR, ifn3
aB3	oscili	aB3, iP6, ifn1
	outch 1, aB3, 2, aB3
endin
; ==============================
; S 4 - HH3.ORC:
; ==============================
; Although this is a more compact instrument design approach
; we kept overall MUSIC V design regarding variable names.

instr	4206, 4207, 4208, 4209

iDUR	=	1 / p3
iP5	=	p4 * giamp_fact 
iP6	=	p5 
iF_a	=	((p1 == 4206) || (p1 == 4208) ? 4202 : 4203)
iF_s	=	4201
iV11	=	((p1 == 4206) || (p1 == 4207) ? 1 : 0)
iV12	=	((p1 == 4208) || (p1 == 4209) ? 1 : 0)

aB3	oscili	iP5*0.5, iDUR, iF_a
aB3	oscili	aB3, iP6, iF_s
	outs	aB3*iV11, aB3*iV12
endin


; ==============================
; S 5 - BELLSB.ORC:
; ==============================
instr	5103, 5104, 3, 4
; Although this is a more compact instrument design approach
; we kept overall MUSIC V design regarding variable names.
; consider using instr 3, 4 as statements are generated by plf6

iDUR	=	1 / p3
iP5	=	p4  * giamp_fact 
iP6	=	p5

ifn1	= 5101
ifn2 = 5102
ifn3 = 5103
ifnx	=	((p1 == 5103) || (p1 == 3) ? ifn3 : ifn2)

aB3	oscili	iP5, iDUR, ifnx
aB3	oscili	aB3, iP6, ifn1

	; these are mono instruments in the original MUSIC V score
	outch 1, aB3, 2, aB3
endin


; ==============================
; S 6 - BLLTX1.ORC:
; ==============================
; based upon S5-BELLSB
instr 6103, 6104
; Although this is a more compact instrument design approach
; we kept overall MUSIC V design regarding variable names.
; consider using instr 3, 4 as statements are generated by plf6

iDUR	=	1 / p3
iP5	=	p4  * giamp_fact 
iP6	=	p5

ifn1	= 6101
ifn2 = 6102
ifn3 = 6103
ifnx	=	((p1 == 6103) || (p1 == 3) ? ifn3 : ifn2)

aB3	oscili	iP5, iDUR, ifnx
aB3	oscili	aB3, iP6, ifn1

	; these are mono instruments in the original MUSIC V score
	outch 1, aB3, 2, aB3
endin

; ==============================
; S 7 - BLTX1.ORC:
; ==============================
instr	7103, 7104
; based upon S5-BELLSB
; Although this is a more compact instrument design approach
; we kept overall MUSIC V design regarding variable names.
; consider using instr 3, 4 as statements are generated by plf6

iDUR	=	1 / p3
iP5	=	p4  * giamp_fact 
iP6	=	p5

ifn1	= 7101
ifn2 = 7102
ifn3 = 7103
ifnx	=	((p1 == 7103) || (p1 == 3) ? ifn3 : ifn2)

aB3	oscili	iP5, iDUR, ifnx
aB3	oscili	aB3, iP6, ifn1

	; these are mono instruments in the original MUSIC V score
	outch 1, aB3, 2, aB3
endin

; ==============================
; S 7 - BLTX2.ORC:
; ==============================
instr	7203, 7204, 13, 14
; based upon S5-BELLSB
; Although this is a more compact instrument design approach
; we kept overall MUSIC V design regarding variable names.
; consider using instr 3, 4 as statements are generated by plf6

; NOTE these instruments provide a transposition factor (p6) for realtime transposition of sequence

iDUR	=	1 / p3
iP5	=	p4  * giamp_fact 
iP6	=	p5

iTransp = p6

ifn1	= 7201
ifn2 = 7202
ifn3 = 7203
ifnx	=	((p1 == 7203) || (p1 == 13) ? ifn3 : ifn2)

aB3	oscili	iP5, iDUR, ifnx
aB3	oscili	aB3, iP6 * iTransp, ifn1

	; these are mono instruments in the original MUSIC V score
	outch 1, aB3, 2, aB3
endin


; ==============================
; S 7 - PHASE7.ORC:
; ==============================
instr 7309
;  "NON TUNNED HARMONIC CASCADE"
iDUR 	=	1/p3
iP5	=	p4 * giamp_fact
iP6	=	p5

iF1	=	7301
iF4	=	p6

aB3  	oscili	(iP5 * 4.6), iDUR, iF4
aB3	oscili	aB3, (iP6 * 0.5), iF1    ; octave down
	outch 1, aB3, 2, aB3 	;  original: mono output
endin

; ==============================
; S 8 - IRR1.ORC:
; ==============================
instr	8101
	iP5 = p4
	aB3   soundin "r8_ir_msbTEST48k.wav" 	; NOTE ATT sr not converted must be the same SR
	aB3	= aB3 * 0.2418 * iP5
	outch 1, aB3
endin

; ==============================
; S 8 - IRR4.ORC:
; ==============================
instr	8201
; This instrument combines two scores. 
; 1-the processing score for the delay-reverb effect
; 2-the 0.2 secs delay on channel 2 on the final mix
	iP5 = p4
	aB3   soundin "r8_ir_msbTEST48k.wav"	; NOTE ATT sr not converted must be the same SR
	aB3	= aB3 * 0.432 * iP5
	aB4	delay aB3, 0.2
	outch 1, aB3, 2, aB4 
endin

; ==============================
; Bells.ORC:
; ==============================
instr	9103, 9104
; Although this is a more compact instrument design approach
; we kept overall MUSIC V design regarding variable names.
; consider using instr 3, 4 as statements are generated by plf6

iDUR	=	1 / p3
iP5	=	p4  * giamp_fact 
iP6	=	p5

ifn1	= 9101
ifn2 = 9102
ifn3 = 9103
ifnx	=	((p1 == 9103) || (p1 == 3) ? ifn3 : ifn2)

aB3	oscili	iP5, iDUR, ifnx
aB3	oscili	aB3, iP6, ifn1

	; these are mono instruments in the original MUSIC V score
	outch 1, aB3, 2, aB3
endin


</CsInstruments>
<CsScore>
; ==============================
;  S 1 - NOISE4.SCO fn:
; ==============================
f1001 0 4096 10 1
f1005 0 512 5   0.0009765 100 1 50 .3 50 1 30 .4 20 1 20 .5 30 1 80 .3 132 .0009765
f1006 0 512 5   0.0009765 150 1 50 .3 30 1 20 .4 20 1 30 .5 40 1 90 .2 82 .0009765
f1007 0 512 7   1 150 1 50 .6 100 .6 50 .5 50 .5 30 .3 82 .3
f1008 0 512 7   1 200 1 312 .25

; ==============================
;  S 2 - VOXN1.SCO fn:
; ==============================
f2101	0	4096	10	1 ; Sinus wave
f2105	0 512	7	0.985	100	1	412	0.99 ; Frequency variation control
f2106	0 512	5	0.001	100	1	320	0.1	80	0.001	12	0.00000001 ; Global envelope
; ==============================
;  S 2 - RVP411.SCO fn:
; ==============================
f2201	0	4096	10	1
f2202	0	512	5	0.001	200	1	312	0.001

; ==============================
;  S 3 - FM8.SCO fn:
; ==============================
f3101	0 4096	10 1
f3102 	0 512	-5	1 20 1 40 .3 40 1 50 1 10 .3 20 1 20 1 100  .3 100 1 12 1
f3103	0 512	-7	0 100 .2 50 .15 5 .15 45 .05 40 .2 20 .16 20 .25 20 .05 15 .07 15 .02 70 .1 10 .5 40 .1 62 0
f3105	0 512	-5	.0001 60 .4 196 1.0 44 .3 50 .5 162 .0001
; ==============================
;  S 3 - LB1113.SCO fn:
; ==============================
f3201     0     4096     10     1     0.1     0.01
f3202     0     512     5     0.001     100     1     412     0.001
f3203     0     512     5     0.001     2     1     510     0.001
; wavetables to replace 3 variants of f3301
f3211     0	4096	10	1	0.1     0.01
f3212     0	4096	10	1		0.5		0		0.2
f3213     0	4096	10	1	
; ==============================
;  S 3 - LOSLO3.SCO fn:
; ==============================
f3301	0 4096	10	1
f3302	0 2049	1	 88       0      4     0	; BELL CURVE (SOUNDIN.88)
f3303	0 4096	5	32	4096	1	; <=> 1.0 -> 2^(-5)=.03125
f3304	0 512	7	0	30	1	482	0
f3305	0 512	5	.005	100	1	310	1	102	.005
f3307	0	512	5	.001	30	1	370	1	80	.1	32	.00001

; ==============================
;  S 3 - PHASE6.SCO fn:
; ==============================
f3402	0	4096	10	.3 0 0 .1 .1 .1 .1 .1 .1 .1
f3405	0	512	7	0 50 1 350 1 112 0
f3406	0	512	7	0 2 1 180 1 312 0

; ==============================
;  S 4 - BELHH4.SCO fn:
; ==============================
f4101	0	4096	10	1
f4103	0	512	25	
0 0.0000001
1 .5
7 1 
255 .05 
499 .0001 
510 .0000001

; ==============================
;  S 4 - HH3.SCO fn:
; ==============================
f4201	0	512	9	1	1	0	
f4202	0	512	27	0	0	49	0.5000	127	1	399	0.2000	511	0	
f4203	0	512	27	0	0	9	0.0100	14	1	504	0.0010	511	0	

; ==============================
;  S 5 - BELLSB.SCO fn:
; ==============================
f5101	0	512	9	1	1	0	
f5102	0	512	27	0	0	1	0.7000	9	0.4000	29	1	49	0.5000	449	0.0500	499	0.0001	511	0	
f5103	0	512	27	0	0	1	0.5000	7	1	255	0.0500	499	0.0001	511	0	

; ==============================
;  S 6 - BLLTX1.SCO fn:
; ==============================
f6101	0	512	9	1	1	0	
f6102	0	512	25	0	0.0010	79	1	511	0.0010	
f6103	0	512	25	0	0.0010	149	1	511	0.0010	

; ==============================
;  S 7 - BLTX1.SCO fn:
; ==============================
f7101	0	512	9	1	1	0	
f7102	0	512	25	0	0.0010	79	1	511	0.0010	
f7103	0	512	25	0 0.00001 49 0.5 199 0.05 209 1 299 0.1 379 0.7 419 0.05 429 0.3 439 0.05 459 0.1 511 0.00001	

; ==============================
;  S 7 - PHASE7.SCO fn:
; ==============================
; harmonics 26, 41, 59, 78, 93 e 111
f7301 0 4096    9	
		26 1 0
		41 1 0
		59 1 0
		78 1 0
		93 1 0
		111 1 0

; original envelopes (f5 = f4 modif)
f7304 0 512      7      0     50     1      462      0
f7305 0 512      7      0    350    1      162      0

; ==============================
;  S Extra - Bells.SCO fn:
; ==============================
f9101	0	512	9	1	1	0	
f9102	0	512	27	0	0	 1 0.7 9	 0.4 29 1 49 0.5 449 0.05 511	0	.001
f9103	0	512	27	0	0	 3	0	 4	0.5	9	1	 511	0	.001



; *********************
; RT score:
; *********************
f0 3600 ; time active = one hour (live version can be 960 = 16 min)
e

</CsScore>
</CsoundSynthesizer>
<bsbPanel>
 <label>Widgets</label>
 <objectName/>
 <x>72</x>
 <y>179</y>
 <width>400</width>
 <height>200</height>
 <visible>true</visible>
 <uuid/>
 <bgcolor mode="nobackground">
  <r>231</r>
  <g>46</g>
  <b>255</b>
 </bgcolor>
 <bsbObject type="BSBVSlider" version="2">
  <objectName>slider1</objectName>
  <x>5</x>
  <y>5</y>
  <width>20</width>
  <height>100</height>
  <uuid>{54c876ec-5f36-4555-a184-c28782e52583}</uuid>
  <visible>true</visible>
  <midichan>0</midichan>
  <midicc>-3</midicc>
  <minimum>0.00000000</minimum>
  <maximum>1.00000000</maximum>
  <value>0.00000000</value>
  <mode>lin</mode>
  <mouseControl act="jump">continuous</mouseControl>
  <resolution>-1.00000000</resolution>
  <randomizable group="0">false</randomizable>
 </bsbObject>
</bsbPanel>
<bsbPresets>
</bsbPresets>
