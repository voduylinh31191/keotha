import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-menu-left',
  templateUrl: './menu-left.component.html',
  styleUrls: ['./menu-left.component.scss']
})
export class MenuLeftComponent implements OnInit {

  @Output() draw = new EventEmitter<any[]>();


  // Tạo mảng 4 hình
  public menuList = [
    {
      class: 'example-box aqua-gradient',
      id: '',
      idInput: 'input1',
      idText: '',
    },
    {
      class: 'example-box1 purple-gradient',
      id: '',
      idInput: 'input2',
      idText: ''
    },
    {
      class: 'example-box2 peach-gradient',
      id: '',
      idInput: 'input3',
      idText: ''
    },
    {
      class: 'example-box3 blue-gradient',
      id: '',
      idInput: 'input4',
      idText: ''
    },
    {
      class: 'example-box4',
      id: '',
      idInput: 'input5',
      idText: ''
    },
  ];
  constructor() { }

  ngOnInit() {
  }

  public drop(event: any) {
    const subEvent = event;
    subEvent.id = '';
    // Bắt Output cho component cha
   this.draw.emit(subEvent);
  }

}
